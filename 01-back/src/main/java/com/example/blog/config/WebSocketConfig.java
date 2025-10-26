    package com.example.blog.config;

    import java.security.Principal;
import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.example.blog.repository.UserRepository;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import jakarta.servlet.http.HttpSession;

    @Configuration
    @EnableWebSocketMessageBroker
    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
        private final UserRepository userRepository;
        public WebSocketConfig(UserRepository userRepository) {
            this.userRepository = userRepository;
        }
        @Override
        public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic","/queue");      // where clients will subscribe
            config.setApplicationDestinationPrefixes("/app"); // where clients send
            config.setUserDestinationPrefix("/user"); // prefix for user-specific messages
        }

        @Override
        public void registerStompEndpoints(StompEndpointRegistry registry) {
            registry.addEndpoint("/ws-notifications")
                    .setHandshakeHandler(new DefaultHandshakeHandler() {
                        @Override
                        protected Principal determineUser(ServerHttpRequest request,
                         WebSocketHandler wsHandler, Map<String, Object> attributes) {
                            if (request instanceof ServletServerHttpRequest servletRequest) {
                                String email = (String) servletRequest.getServletRequest().getAttribute("userEmail");
                                String finalname = userRepository.findByEmail(email).get().getUsername();
                                    if (finalname != null) {
                                        return () -> finalname; // Principal name is the user's username
                                    }
                            }
                        return null;
            }
        })
                    .setAllowedOriginPatterns("*")
                    .withSockJS();
        }
       
    }
