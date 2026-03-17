package es.upm.tfg.thesisplatform.student.service;

import es.upm.tfg.thesisplatform.exception.ForbiddenOperationException;
import es.upm.tfg.thesisplatform.exception.StudentProfileNotFoundException;
import es.upm.tfg.thesisplatform.student.domain.StudentProfile;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileRequest;
import es.upm.tfg.thesisplatform.student.dto.StudentProfileResponse;
import es.upm.tfg.thesisplatform.student.repository.StudentProfileRepository;
import es.upm.tfg.thesisplatform.user.domain.User;
import es.upm.tfg.thesisplatform.user.domain.UserRole;
import es.upm.tfg.thesisplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public StudentProfileResponse getMyProfile(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new StudentProfileNotFoundException(email));

        return mapToResponse(profile);
    }

    public StudentProfileResponse upsertMyProfile(String email, StudentProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new StudentProfileNotFoundException(email));

        if (user.getRole() != UserRole.STUDENT) {
            throw new ForbiddenOperationException("Only users with STUDENT role can manage a student profile");
        }

        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElse(
                        StudentProfile.builder()
                                .user(user)
                                .build());

        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setOriginInstitution(request.getOriginInstitution().trim());
        profile.setMotivation(request.getMotivation().trim());
        profile.setProposedThesisTitle(request.getProposedThesisTitle().trim());
        profile.setHasFunding(request.getHasFunding());
        profile.setFundingType(request.getFundingType());
        profile.setFundingDurationMonths(request.getFundingDurationMonths());
        profile.setWillingToRelocateToMadrid(request.getWillingToRelocateToMadrid());
        profile.setDedicationType(request.getDedicationType());
        profile.setAdditionalInformation(request.getAdditionalInformation());
        profile.setCvUrl(request.getCvUrl().trim());

        StudentProfile savedProfile = studentProfileRepository.save(profile);

        return mapToResponse(savedProfile);
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .email(profile.getUser().getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .originInstitution(profile.getOriginInstitution())
                .motivation(profile.getMotivation())
                .proposedThesisTitle(profile.getProposedThesisTitle())
                .hasFunding(profile.isHasFunding())
                .fundingType(profile.getFundingType())
                .fundingDurationMonths(profile.getFundingDurationMonths())
                .willingToRelocateToMadrid(profile.isWillingToRelocateToMadrid())
                .dedicationType(profile.getDedicationType())
                .additionalInformation(profile.getAdditionalInformation())
                .cvUrl(profile.getCvUrl())
                .build();
    }
}