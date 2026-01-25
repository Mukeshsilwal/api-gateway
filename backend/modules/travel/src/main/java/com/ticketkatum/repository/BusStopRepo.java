package com.ticketkatum.repository;

import com.ticketkatum.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository
public interface BusStopRepo extends JpaRepository<BusStop, Long> {

}
