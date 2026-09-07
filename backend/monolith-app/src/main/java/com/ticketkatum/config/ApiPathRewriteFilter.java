package com.ticketkatum.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Rewrites external gateway paths (/api/web/**) to internal BFF controller paths (/api/bff/v1/**).
 * This is a small, non-invasive adapter to avoid changing many controllers while the gateway
 * continues to use `/api/web` as public base path.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class ApiPathRewriteFilter extends HttpFilter {

    private static final String EXTERNAL_BASE = "/api/web";
    private static final String INTERNAL_BASE = "/api/bff/v1";

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        String uri = req.getRequestURI();

        if (uri != null && (uri.equals(EXTERNAL_BASE) || uri.startsWith(EXTERNAL_BASE + "/"))) {
            String newUri = INTERNAL_BASE + uri.substring(EXTERNAL_BASE.length());
            log.debug("Rewriting incoming URI '{}' -> '{}'", uri, newUri);

            // Forward internally to the rewritten path so Spring picks the existing controllers
            req.getRequestDispatcher(newUri + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && (uri.equals("/auth") || uri.startsWith("/auth/"))) {
            String newUri = INTERNAL_BASE + uri;
            log.debug("Rewriting legacy auth URI '{}' -> '{}'", uri, newUri);

            req.getRequestDispatcher(newUri + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && (uri.equals("/api/bff/v1/admin/requests") || uri.equals("/api/admin/requests"))) {
            req.getRequestDispatcher("/api/bff/v1/registration/admin/requests" + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && (uri.startsWith("/api/bff/v1/admin/approve/") || uri.startsWith("/api/admin/approve/"))) {
            String id = uri.substring(uri.lastIndexOf('/') + 1);
            req.getRequestDispatcher("/api/bff/v1/registration/admin/approve/" + id + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && (uri.equals("/api/bff/v1/admin/register") || uri.equals("/api/admin/register") || uri.equals("/api/bff/v1/admin/request"))) {
            req.getRequestDispatcher("/api/bff/v1/registration/admin/request" + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && (uri.equals("/api/bff/v1/find") || uri.startsWith("/api/bff/v1/find/"))) {
            String newUri = "/api/v1/find" + uri.substring("/api/bff/v1/find".length());
            log.debug("Rewriting hotel find URI '{}' -> '{}'", uri, newUri);
            req.getRequestDispatcher(newUri + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        if (uri != null && uri.matches("^/api/bff/v1/buses/bus-details/?\\d+/complete$")) {
            String busId = uri.replaceAll("^/api/bff/v1/buses/bus-details/?(\\d+)/complete$", "$1");
            log.debug("Rewriting bus details URI '{}' -> '/api/bff/v1/buses/{}/complete'", uri, busId);
            req.getRequestDispatcher("/api/bff/v1/buses/" + busId + "/complete" + (req.getQueryString() != null ? "?" + req.getQueryString() : ""))
                    .forward(req, res);
            return;
        }

        chain.doFilter(req, res);
    }
}
