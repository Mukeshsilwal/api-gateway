package com.ticketkatum.payment;


import com.ticketkatum.entity.PaymentTransaction;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;

public interface PaymentProvider {
    Response doPayment(Request request, PaymentTransaction txn);

    Response verifyPayment(Request request, PaymentTransaction txn);
}
