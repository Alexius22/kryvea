package cvss

func IsValidVersion(version int) bool {
	for _, v := range CVSSVersions {
		if v == version {
			return true
		}
	}
	return false
}
