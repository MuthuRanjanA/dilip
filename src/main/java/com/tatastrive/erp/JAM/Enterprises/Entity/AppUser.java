package com.tatastrive.erp.JAM.Enterprises.Entity;

import com.tatastrive.erp.JAM.Enterprises.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String password;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean temporaryPassword = true;

    @OneToOne
    @JoinColumn(
            name = "employee_id",
            unique = true
    )
    private Employee employee;
}
