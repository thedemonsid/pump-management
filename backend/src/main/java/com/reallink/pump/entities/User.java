package com.reallink.pump.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_username_pump", columnNames = { "username", "pump_master_id" }),
    @UniqueConstraint(name = "uk_mobile_number_pump", columnNames = { "mobile_number", "pump_master_id" })
}, indexes = {
    @Index(name = "idx_pump_master_id_user", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

  @NotNull(message = "Pump master is required")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_pump_master"))
  private PumpInfoMaster pumpMaster;

  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  @Column(name = "username", nullable = false, length = 50)
  private String username;

  @NotBlank(message = "Password is required")
  @Column(name = "password", nullable = false, length = 255)
  private String password;

  @NotBlank(message = "Mobile number is required")
  @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Mobile number should be valid")
  @Column(name = "mobile_number", nullable = false, length = 15)
  private String mobileNumber;

  @NotNull(message = "Role is required")
  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private UserType role = UserType.USER;

  @Column(name = "enabled", nullable = false)
  private Boolean enabled = true;

  public User(String username, String password, String mobileNumber, UserType role, PumpInfoMaster pumpMaster) {
    this.username = username;
    this.password = password;
    this.mobileNumber = mobileNumber;
    this.role = role;
    this.pumpMaster = pumpMaster;
  }
}
