#!/bin/bash

# JVM Performance Tuning for Spring Boot Services
# Add these to your service startup scripts or Dockerfile

# Heap Size (adjust based on available memory)
JAVA_OPTS="-Xms2G -Xmx4G"

# Garbage Collection - G1GC (recommended for low latency)
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"
JAVA_OPTS="$JAVA_OPTS -XX:InitiatingHeapOccupancyPercent=45"
JAVA_OPTS="$JAVA_OPTS -XX:G1HeapRegionSize=16M"
JAVA_OPTS="$JAVA_OPTS -XX:G1ReservePercent=10"
JAVA_OPTS="$JAVA_OPTS -XX:ConcGCThreads=4"

# Alternative: ZGC for ultra-low latency (Java 15+)
# JAVA_OPTS="$JAVA_OPTS -XX:+UseZGC"
# JAVA_OPTS="$JAVA_OPTS -XX:ZCollectionInterval=5"

# JIT Compiler Optimization
JAVA_OPTS="$JAVA_OPTS -XX:+TieredCompilation"
JAVA_OPTS="$JAVA_OPTS -XX:TieredStopAtLevel=1"  # Faster startup
JAVA_OPTS="$JAVA_OPTS -XX:+UseStringDeduplication"

# Memory Management
JAVA_OPTS="$JAVA_OPTS -XX:+AlwaysPreTouch"  # Pre-touch memory pages
JAVA_OPTS="$JAVA_OPTS -XX:+UseLargePages"   # Use large memory pages
JAVA_OPTS="$JAVA_OPTS -XX:+DisableExplicitGC"

# Monitoring and Diagnostics
JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/var/log/heapdump.hprof"
JAVA_OPTS="$JAVA_OPTS -XX:+PrintGCDetails"
JAVA_OPTS="$JAVA_OPTS -XX:+PrintGCDateStamps"
JAVA_OPTS="$JAVA_OPTS -Xloggc:/var/log/gc.log"

# JMX for monitoring
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.port=9999"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.ssl=false"

# Network Tuning
JAVA_OPTS="$JAVA_OPTS -Djava.net.preferIPv4Stack=true"

# Export for use
export JAVA_OPTS

echo "JVM Options configured: $JAVA_OPTS"
