package cvss

func IsValidVersion(version string) bool {
	for _, v := range CVSSVersions {
		if v == version {
			return true
		}
	}
	return false
}
