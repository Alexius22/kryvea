package cvss

import (
	"testing"
)

func TestParseVector(t *testing.T) {
	tests := []struct {
		name          string
		vector        string
		version       string
		expectedScore float64
		expectError   bool
	}{
		// Test cases for CVSS2
		{
			name:          "Valid CVSS2 vector",
			vector:        "AV:L/AC:L/Au:S/C:P/I:P/A:C",
			version:       CVSS2,
			expectedScore: 5.7,
			expectError:   false,
		},
		{
			name:        "Invalid CVSS2 vector",
			vector:      "INVALID_VECTOR",
			version:     CVSS2,
			expectError: true,
		},

		// Test cases for CVSS3
		{
			name:          "Valid CVSS3 vector",
			vector:        "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
			version:       CVSS3,
			expectedScore: 9.8,
			expectError:   false,
		},
		{
			name:        "Invalid CVSS3 vector",
			vector:      "INVALID_VECTOR",
			version:     CVSS3,
			expectError: true,
		},

		// Test cases for CVSS31
		{
			name:          "Valid CVSS3 vector",
			vector:        "CVSS:3.1/AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:L/E:P/RL:X/RC:X",
			version:       CVSS31,
			expectedScore: 4.4,
			expectError:   false,
		},
		{
			name:        "Invalid CVSS31 vector",
			vector:      "INVALID_VECTOR",
			version:     CVSS31,
			expectError: true,
		},

		// Test cases for CVSS4
		{
			name:          "Valid CVSS4 vector",
			vector:        "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:H/SC:L/SI:L/SA:H",
			version:       CVSS4,
			expectedScore: 9.3,
			expectError:   false,
		},
		{
			name:        "Invalid CVSS4 vector",
			vector:      "INVALID_VECTOR",
			version:     CVSS4,
			expectError: true,
		},

		// Test case for invalid version
		{
			name:        "Invalid CVSS version",
			vector:      "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
			version:     "99",
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			score, err := ParseVector(tc.vector, tc.version)

			if tc.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Did not expect an error but got: %v", err)
				}
				if score != tc.expectedScore {
					t.Errorf("Expected score %v but got %v", tc.expectedScore, score)
				}
			}
		})
	}
}
