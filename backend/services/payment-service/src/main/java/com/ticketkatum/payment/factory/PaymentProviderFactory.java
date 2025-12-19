package com.ticketkatum.payment.factory;

import com.ticketkatum.payment.PaymentProvider;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PaymentProviderFactory {

    private final Map<String, PaymentProvider> providers;

    public PaymentProviderFactory(Map<String, PaymentProvider> providers) {
        this.providers = providers;
    }

    public PaymentProvider get(String providerName) {
        PaymentProvider provider = providers.get(providerName.toLowerCase());
        if (provider == null) throw new IllegalArgumentException("Invalid provider");
        return provider;
    }
}

