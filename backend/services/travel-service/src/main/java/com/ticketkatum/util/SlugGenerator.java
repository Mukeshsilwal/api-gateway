package com.ticketkatum.util;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Slug Generator Utility
 * Generates URL-friendly slugs
 */
@Component
public class SlugGenerator {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");

    /**
     * Generate slug from text
     */
    public String generateSlug(String text) {
        String noWhitespace = WHITESPACE.matcher(text).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        slug = MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
        return slug.toLowerCase(Locale.ENGLISH).trim();
    }

    /**
     * Generate unique slug with suffix
     */
    public String generateUniqueSlug(String text) {
        String baseSlug = generateSlug(text);
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        return baseSlug + "-" + uniqueSuffix;
    }
}
