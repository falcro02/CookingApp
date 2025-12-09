const validateCreateMeal = (body) => {
    const errors = [];

    // REMOVED: if (!body.userId) ... -> We trust the token now.

    if (!body.name) errors.push("Missing field: name");
    if (!body.weekDay) errors.push("Missing field: weekDay");
    if (!body.mealType) errors.push("Missing field: mealType");

    if (errors.length > 0) {
        throw new Error(`Validation Failed: ${errors.join(', ')}`);
    }
    return true;
};
// ... validateUpdateMeal stays mostly the same, just remove userId checks if any
const validateUpdateMeal = (id, body) => {
    if (!id) throw new Error("Validation Failed: Missing 'id' for update");
    return true;
};

module.exports = { validateCreateMeal, validateUpdateMeal };