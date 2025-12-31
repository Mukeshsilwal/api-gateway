package com.ticketkatum.repository;

import com.ticketkatum.entity.Route;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepo extends JpaRepository<Route, Long> {
    List<Route> findByDestinationBusStop(Route route12);
    Slice<Route> findByIdGreaterThan(Long id, Pageable pageable);

}
