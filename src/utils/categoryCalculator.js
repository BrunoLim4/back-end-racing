// utils/categoryCalculator.js
const calculateCategoryFromBirthDate = (birthDate) => {
    if (!birthDate) return 'Não Definida';

    const birthYear = new Date(birthDate).getFullYear();
    let category = '';

    if (birthYear >= 2010 && birthYear <= 2013) {
        category = 'Sub14';
    } else if (birthYear >= 2014 && birthYear <= 2016) {
        category = 'Sub10';
    } else if (birthYear >= 2017 && birthYear <= 2018) {
        category = 'Sub08';
    } else if (birthYear >= 2019 && birthYear <= 2020) {
        category = 'Sub06';
    } else {
        category = 'Fora de Categoria';
    }
    return category;
};

module.exports = { calculateCategoryFromBirthDate };