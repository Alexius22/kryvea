package config

func GetWeb() web {
	return conf.Web
}

func GetDSN() dsn {
	return conf.DSN
}

func GetMongoConfig() string {
	return conf.MongoURI
}

func GetCustomer() customer {
	return conf.Customer
}
