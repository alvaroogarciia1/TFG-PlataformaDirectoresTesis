package es.upm.tfg.thesisplatform.admin.dto;

import es.upm.tfg.thesisplatform.user.domain.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserSearchRequest {

    private String query;
    private UserRole role;
    private Boolean active;
}