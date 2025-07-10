package poc

func IsValidType(t string) bool {
	if _, ok := POCTypes[t]; ok {
		return true
	}
	return false
}
