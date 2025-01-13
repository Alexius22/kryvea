package db

import "errors"

type Category struct {
	Model
	Index string `json:"index" gorm:"uniqueIndex:idx_category"`
	Year  int    `json:"year" gorm:"uniqueIndex:idx_category"`
	Name  string `json:"name" gorm:"uniqueIndex:idx_category"`
}

func AddCategory(category Category) error {
	result := Database.Create(&category)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("Failed to create category")
	}
	return nil
}

func GetAllCategories() ([]Category, error) {
	var categories []Category
	result := Database.Find(&categories)
	if result.Error != nil {
		return categories, result.Error
	}
	return categories, nil
}

func GetCategoryByID(id string) (Category, error) {
	if id == "" {
		return Category{}, errors.New("ID is required")
	}

	var category Category
	result := Database.First(&category, Model{ID: id})
	if result.Error != nil {
		return category, result.Error
	}
	if result.RowsAffected == 0 {
		return category, errors.New("Category not found")
	}
	return category, nil
}

func GetCategoriesByIndex(index string) ([]Category, error) {
	if index == "" {
		return []Category{}, errors.New("Index is required")
	}

	var categories []Category
	result := Database.Find(&categories, Category{Index: index})
	if result.Error != nil {
		return categories, result.Error
	}
	return categories, nil
}

func GetCategoriesByYear(year int) ([]Category, error) {
	if year == 0 {
		return []Category{}, errors.New("Year is required")
	}

	var categories []Category
	result := Database.Find(&categories, Category{Year: year})
	if result.Error != nil {
		return categories, result.Error
	}
	return categories, nil
}

func GetCategoriesByName(name string) ([]Category, error) {
	if name == "" {
		return []Category{}, errors.New("Name is required")
	}

	var categories []Category
	result := Database.Find(&categories, "name ILIKE ?", "%"+sanitizeLikeQuery(name)+"%")
	if result.Error != nil {
		return categories, result.Error
	}
	return categories, nil
}

func IsValidCategory(category Category) bool {
	if category.Index == "" || category.Year == 0 || category.Name == "" {
		return false
	}

	var categories []Category
	result := Database.First(&categories, Category{Index: category.Index, Year: category.Year, Name: category.Name})
	if result.Error != nil {
		return false
	}
	if result.RowsAffected == 0 {
		return false
	}
	return true
}
