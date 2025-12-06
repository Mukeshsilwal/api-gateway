package com.ticketkatum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bus_stop")
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @OneToMany(mappedBy = "sourceBusStop", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Route> sourceRoutes = new ArrayList<>();

    @OneToMany(mappedBy = "destinationBusStop", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Route> destinationRoutes = new ArrayList<>();
}
