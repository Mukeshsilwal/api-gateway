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

        chain.doFilter(req, res);
    }
}
