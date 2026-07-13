package com.tatastrive.erp.JAM.Enterprises.config;

import java.util.Map;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import com.tatastrive.erp.JAM.Enterprises.Role;
import com.tatastrive.erp.JAM.Enterprises.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	JwtService jwtService;
	@Autowired
	private AppUserRepository userRepo;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private AuthenticationManager authManager;

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> request) {

		String username = request.get("email");
		String password = request.get("password");

		Authentication authentication =
				authManager.authenticate(
						new UsernamePasswordAuthenticationToken(username, password)
				);

		if (authentication.isAuthenticated()) {

			AppUser user = userRepo.findByEmail(username)
					.orElseThrow(() -> new RuntimeException("User not found"));

			String token = jwtService.generateToken(username);

			AuthResponse response =
					new AuthResponse(token, user.getRole().toString());

			return ResponseEntity.ok(response);
		}

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	}
	
	@PostMapping("/register")
	public String register(@RequestBody Map<String, String> request)
	{
		
		AppUser newUser = new AppUser();
		newUser.setName(request.get("name"));
		newUser.setEmail(request.get("email"));
		newUser.setPassword(passwordEncoder.encode(request.get("password")) );
		newUser.setRole( Role.valueOf(request.get("role")) );
		userRepo.save(newUser);
		return "register  successfuly";
	}

}
