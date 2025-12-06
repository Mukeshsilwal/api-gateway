package com.ticketkatum.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AgentTrackingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String ONLINE_AGENTS = "agents:online";
    private static final String AGENT_STATUS = "agent:status";

    public void setAgentOnline(Long agentId) {
        redisTemplate.opsForSet().add(ONLINE_AGENTS, agentId.toString());
        redisTemplate.opsForHash().put(AGENT_STATUS,
                agentId.toString(), "ONLINE");
    }

    public void setAgentOffline(Long agentId) {
        redisTemplate.opsForSet().remove(ONLINE_AGENTS, agentId.toString());
        redisTemplate.opsForHash().put(AGENT_STATUS,
                agentId.toString(), "OFFLINE");
    }

    public Set<Object> getOnlineAgents() {
        return redisTemplate.opsForSet().members(ONLINE_AGENTS);
    }

    public String getAgentStatus(Long agentId) {
        Object status = redisTemplate.opsForHash()
                .get(AGENT_STATUS, agentId.toString());
        return status != null ? status.toString() : "UNKNOWN";
    }

    public Long getOnlineAgentCount() {
        return redisTemplate.opsForSet().size(ONLINE_AGENTS);
    }
}