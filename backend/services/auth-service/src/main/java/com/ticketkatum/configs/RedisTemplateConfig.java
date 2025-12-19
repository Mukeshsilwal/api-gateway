//package com.ticketkatum.configs;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//
//@Configuration
//public class RedisTemplateConfig {
//
//    @Bean(name = "customRedisTemplate")
//    public RedisTemplate<String, Object> customRedisTemplate(RedisConnectionFactory connectionFactory) {
//
//        RedisTemplate<String, Object> template = new RedisTemplate<>();
//        template.setConnectionFactory(connectionFactory);
//        template.afterPropertiesSet();
//
//        return template;
//    }
//}
//
