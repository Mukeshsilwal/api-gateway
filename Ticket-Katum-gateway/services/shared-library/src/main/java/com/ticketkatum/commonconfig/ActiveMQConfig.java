package com.ticketkatum.commonconfig;

import jakarta.jms.ConnectionFactory;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.core.JmsTemplate;

@Configuration
@EnableJms
public class ActiveMQConfig {


    @Bean
    public ActiveMQConnectionFactory connectionFactory() {
        ActiveMQConnectionFactory factory =
                new ActiveMQConnectionFactory("vm://embedded-broker");
        factory.setTrustAllPackages(true);
        return factory;
    }

    @Bean
    public JmsTemplate jmsTemplate(ConnectionFactory factory) {
        return new JmsTemplate(factory); // QUEUE by default
    }

    @Bean
    public JmsTemplate topicJmsTemplate(ConnectionFactory factory) {
        JmsTemplate template = new JmsTemplate(factory);
        template.setPubSubDomain(true); // TOPIC
        return template;
    }
}
