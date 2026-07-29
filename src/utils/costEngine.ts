import { Ingredient, RecipeIngredient, RecipeCost, IngredientUnit } from '../types';

/**
 * Calculates normalized cost per usage unit of an ingredient based on purchase units
 */
export const calculateNormalizedCost = (
  purchasePrice: number,
  purchaseQty: number,
  purchaseUnit: IngredientUnit,
  usageUnit: IngredientUnit
): number => {
  if (!purchaseQty || purchaseQty <= 0) return 0;
  
  let totalUsageUnitsInPurchase = purchaseQty;

  if (purchaseUnit === 'kilogramo' && usageUnit === 'gramo') {
    totalUsageUnitsInPurchase = purchaseQty * 1000;
  } else if (purchaseUnit === 'litro' && usageUnit === 'mililitro') {
    totalUsageUnitsInPurchase = purchaseQty * 1000;
  } else if (purchaseUnit === 'docena' && usageUnit === 'unidad') {
    totalUsageUnitsInPurchase = purchaseQty * 12;
  }

  return purchasePrice / totalUsageUnitsInPurchase;
};

/**
 * Calculates item cost for a specific ingredient in a recipe considering waste
 */
export const calculateRecipeItemCost = (
  usageQty: number,
  normalizedCost: number,
  wastePercentage: number = 0
): number => {
  const baseCost = usageQty * normalizedCost;
  const wasteMultiplier = 1 + (wastePercentage / 100);
  return Math.round(baseCost * wasteMultiplier * 100) / 100;
};

/**
 * Calculates full recipe costs, suggested price, margins and profit
 */
export const calculateRecipeCostDetails = (
  productId: string,
  productName: string,
  recipeItems: RecipeIngredient[],
  packagingCost: number = 0,
  otherDirectCosts: number = 0,
  targetMargin: number = 0.60,
  currentPrice: number = 0
): RecipeCost => {
  const ingredientsCostTotal = recipeItems.reduce((acc, item) => acc + item.itemCost, 0);
  const totalCost = Math.round(ingredientsCostTotal + packagingCost + otherDirectCosts);

  // Formula: Precio Sugerido = Costo Total / (1 - Margen Objetivo)
  const validMargin = Math.min(Math.max(targetMargin, 0.05), 0.95);
  const suggestedPrice = Math.round(totalCost / (1 - validMargin));

  const grossProfit = Math.max(0, currentPrice - totalCost);
  const grossMargin = currentPrice > 0 ? Math.round(((currentPrice - totalCost) / currentPrice) * 100) : 0;
  const priceDiff = suggestedPrice - currentPrice;

  return {
    productId,
    productName,
    recipeItems,
    packagingCost,
    otherDirectCosts,
    targetMargin,
    totalCost,
    suggestedPrice,
    currentPrice,
    grossMargin,
    grossProfit,
    priceDiff,
  };
};
