package com.ticketkatum.commonconfig;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.jms.ConnectionFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.support.converter.MappingJackson2MessageConverter;
import org.springframework.jms.support.converter.MessageType;

@Configuration
@EnableJms
public class ActiveMQConfig {

    @Bean
    public ObjectMapper jmsObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public MappingJackson2MessageConverter jacksonJmsMessageConverter(
            @Qualifier("jmsObjectMapper") ObjectMapper jmsObjectMapper) {

        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();

        converter.setTargetType(MessageType.TEXT);
        converter.setTypeIdPropertyName("_type");
        converter.setObjectMapper(jmsObjectMapper);

        return converter;
    }

    @Bean
    public JmsTemplate jmsTemplate(
            ConnectionFactory connectionFactory,
            MappingJackson2MessageConverter converter) {

        JmsTemplate template = new JmsTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }

    @Bean(name = "topicJmsTemplate")
    @Primary
    public JmsTemplate topicJmsTemplate(
            ConnectionFactory connectionFactory,
            MappingJackson2MessageConverter converter) {

        JmsTemplate template = new JmsTemplate(connectionFactory);
        template.setPubSubDomain(true);
        template.setMessageConverter(converter);
        return template;
    }
}
