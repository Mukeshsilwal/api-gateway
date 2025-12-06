-- ================================================================
-- Kong JWT Authentication Plugin
-- File: gateway/kong/plugins/jwt-auth/handler.lua
-- ================================================================

local jwt = require "resty.jwt"
local jwt_decoder = require "kong.plugins.jwt.jwt_parser"
local BasePlugin = require "kong.plugins.base_plugin"
local constants = require "kong.constants"
local json = require "cjson"

local kong = kong
local type = type
local error = error
local ipairs = ipairs
local tostring = tostring
local re_gmatch = ngx.re.gmatch

local JwtAuthHandler = BasePlugin:extend()

JwtAuthHandler.PRIORITY = 1005
JwtAuthHandler.VERSION = "1.0.0"

-- ============================================================
-- Helper Functions
-- ============================================================

local function retrieve_token(config)
  local request_headers = kong.request.get_headers()
  local token
  local where

  -- Check Authorization header
  local authorization_header = request_headers["authorization"]
  if authorization_header then
    if type(authorization_header) == "table" then
      authorization_header = authorization_header[1]
    end

    local iterator, iter_err = re_gmatch(authorization_header,
      "\\s*[Bb]earer\\s+(.+)", "jo")
    if not iterator then
      kong.log.err("Failed to parse Authorization header: ", iter_err)
      return nil, nil
    end

    local m, err = iterator()
    if err then
      kong.log.err("Failed to retrieve token: ", err)
      return nil, nil
    end

    if m and #m > 0 then
      token = m[1]
      where = "header"
    end
  end

  -- Check query parameter
  if not token and config.uri_param_names then
    local query_params = kong.request.get_query()
    for _, param_name in ipairs(config.uri_param_names) do
      local param = query_params[param_name]
      if param then
        if type(param) == "table" then
          param = param[1]
        end
        token = param
        where = "query"
        break
      end
    end
  end

  -- Check cookie
  if not token and config.cookie_names then
    local cookie_header = request_headers["cookie"]
    if cookie_header then
      for _, cookie_name in ipairs(config.cookie_names) do
        local cookie_val = cookie_header:match(cookie_name .. "=([^;]+)")
        if cookie_val then
          token = cookie_val
          where = "cookie"
          break
        end
      end
    end
  end

  return token, where
end

local function verify_jwt_signature(token, secret)
  local jwt_obj = jwt:verify(secret, token)

  if not jwt_obj.verified then
    kong.log.err("JWT signature verification failed: ", jwt_obj.reason)
    return nil, "Invalid signature"
  end

  return jwt_obj
end

local function check_token_expiry(claims)
  local now = ngx.time()

  -- Check expiration (exp)
  if claims.exp and claims.exp < now then
    return false, "Token expired"
  end

  -- Check not before (nbf)
  if claims.nbf and claims.nbf > now then
    return false, "Token not valid yet"
  end

  return true
end

local function validate_claims(claims, config)
  -- Validate issuer
  if config.issuer and claims.iss ~= config.issuer then
    return false, "Invalid issuer"
  end

  -- Validate audience
  if config.audience and claims.aud ~= config.audience then
    return false, "Invalid audience"
  end

  -- Check required claims
  if config.required_claims then
    for _, claim_name in ipairs(config.required_claims) do
      if not claims[claim_name] then
        return false, "Missing required claim: " .. claim_name
      end
    end
  end

  return true
end

-- ============================================================
-- Main Plugin Handler
-- ============================================================

function JwtAuthHandler:new()
  JwtAuthHandler.super.new(self, "jwt-auth")
end

function JwtAuthHandler:access(config)
  JwtAuthHandler.super.access(self)

  -- Retrieve JWT token
  local token, token_location = retrieve_token(config)

  if not token then
    return kong.response.exit(401, {
      message = "Unauthorized",
      error = "missing_token",
      description = "No JWT token found in request"
    })
  end

  kong.log.debug("JWT token found in: ", token_location)

  -- Verify JWT signature
  local jwt_obj, err = verify_jwt_signature(token, config.secret)

  if not jwt_obj then
    return kong.response.exit(401, {
      message = "Unauthorized",
      error = "invalid_token",
      description = err
    })
  end

  local claims = jwt_obj.payload

  -- Check token expiry
  local valid, expiry_err = check_token_expiry(claims)
  if not valid then
    return kong.response.exit(401, {
      message = "Unauthorized",
      error = "token_expired",
      description = expiry_err
    })
  end

  -- Validate claims
  local claims_valid, claims_err = validate_claims(claims, config)
  if not claims_valid then
    return kong.response.exit(403, {
      message = "Forbidden",
      error = "invalid_claims",
      description = claims_err
    })
  end

  -- Set headers for downstream services
  kong.service.request.set_header("X-User-ID", claims.sub or claims.userId)
  kong.service.request.set_header("X-User-Email", claims.email)
  kong.service.request.set_header("X-User-Roles", json.encode(claims.roles or {}))
  kong.service.request.set_header("X-Auth-Token-ID", claims.jti)

  -- Store in context for other plugins
  kong.ctx.shared.authenticated_credential = {
    id = claims.sub or claims.userId,
    email = claims.email,
    roles = claims.roles,
    token_id = claims.jti
  }

  -- Hide credentials if configured
  if config.hide_credentials then
    kong.service.request.clear_header("Authorization")
  end

  kong.log.info("JWT authentication successful for user: ",
    claims.sub or claims.userId)
end

return JwtAuthHandler

-- ================================================================
-- Plugin Schema Definition
-- File: gateway/kong/plugins/jwt-auth/schema.lua
-- ================================================================

local typedefs = require "kong.db.schema.typedefs"

return {
  name = "jwt-auth",
  fields = {
    { protocols = typedefs.protocols_http },
    { config = {
        type = "record",
        fields = {
          { secret = {
              type = "string",
              required = true,
              encrypted = true,
              referenceable = true,
              description = "The secret key to verify JWT signatures"
          }},
          { uri_param_names = {
              type = "array",
              elements = { type = "string" },
              default = { "jwt" },
              description = "Query parameter names to look for JWT token"
          }},
          { cookie_names = {
              type = "array",
              elements = { type = "string" },
              default = { "jwt" },
              description = "Cookie names to look for JWT token"
          }},
          { hide_credentials = {
              type = "boolean",
              default = true,
              description = "Hide JWT token from upstream service"
          }},
          { issuer = {
              type = "string",
              description = "Expected JWT issuer (iss claim)"
          }},
          { audience = {
              type = "string",
              description = "Expected JWT audience (aud claim)"
          }},
          { required_claims = {
              type = "array",
              elements = { type = "string" },
              description = "List of required claims in JWT"
          }},
          { claims_to_verify = {
              type = "array",
              elements = { type = "string" },
              default = { "exp", "nbf" },
              description = "Claims to verify"
          }},
          { maximum_expiration = {
              type = "number",
              description = "Maximum token expiration time in seconds"
          }},
          { run_on_preflight = {
              type = "boolean",
              default = false,
              description = "Run authentication on OPTIONS requests"
          }}
        }
    }}
  }
}