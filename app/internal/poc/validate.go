package poc

func IsValidType(t string) bool {
	for _, v := range POCTypes {
		if v == t {
			return true
		}
	}
	return false
}
