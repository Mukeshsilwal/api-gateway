package com.ticketkatum.repository;

import com.ticketkatum.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusStopRepo extends JpaRepository<BusStop, Long> {

}
