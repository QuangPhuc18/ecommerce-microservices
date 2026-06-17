package com.c2c.product.util;

import java.text.Normalizer;

public class SlugGenerator {

    private SlugGenerator() {}

    public static String generate(String input) {
        if (input == null || input.isBlank()) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug;
    }
}
