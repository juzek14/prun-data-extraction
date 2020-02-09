import { BaseExtractor } from './base-extractor';
import { State } from '../state/';

class BuildingExtractor implements BaseExtractor {

    Parse(state: State): any {

        var buildings = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return {
                    ticker: building.ticker,
                    area: building.areaCost,
                    expertise: building.expertise
                }
            });

        var buildingCosts = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return building.buildingCosts.map(cost => {
                    return { 
                        key: `${building.ticker}-${cost.material.ticker}`,
                        building: building.ticker,
                        material: cost.material.ticker,
                        amount: cost.amount,
                    };
                })
            }).reduce((obj, x) => obj.concat(x), []);

        var buildingWorkforce = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return building.workforceCapacities.map(workforce => {
                    return { 
                        key: `${building.ticker}-${workforce.level}`,
                        building: building.ticker,
                        level: workforce.level,
                        capacity: workforce.capacity,
                    };
                })
            }).reduce((obj, x) => obj.concat(x), []);

        var buildingRecipes = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return building.recipes.map((recipe,ix) => {
                    return { 
                        key: `${building.ticker}-${ix}-${recipe.outputs[0].material.ticker}`,
                        building: building.ticker,
                        duration: recipe.duration.millis / 1000,
                    };
                })
            }).reduce((obj, x) => obj.concat(x), []);

        var recipeInputs = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return building.recipes.map((recipe,ix) => {
                    return recipe.inputs.map(input => {
                        return { 
                            key: `${building.ticker}-${ix}-${recipe.outputs[0].material.ticker}`,
                            material: input.material.ticker,
                            amount: input.amount,
                        };
                    });
                })
            }).reduce((obj, x) => obj.concat(x), [])
            .reduce((obj, x) => obj.concat(x), []);

        var recipeOutputs = Object.keys(state.production.reactorData.data)
            .map(key => state.production.reactorData.data[key])
            .map(building => {
                return building.recipes.map((recipe,ix) => {
                    return recipe.outputs.map(output => {
                        return { 
                            key: `${building.ticker}-${ix}-${recipe.outputs[0].material.ticker}`,
                            material: output.material.ticker,
                            amount: output.amount,
                        };
                    });
                })
            }).reduce((obj, x) => obj.concat(x), [])
            .reduce((obj, x) => obj.concat(x), []);

        var materials = state.materials.categories
            .map(category => {
                return category.materials.map(material => {
                    return {
                        ticker: material.ticker,
                        name: material.name,
                        category: category.name,
                        weight: material.weight,
                        volume: material.volume,
                    };
                })
            })
            .reduce((obj, x) => obj.concat(x), []);

//        var moreRecipes = Object.keys(state.materials.materialData.data)
//            .map(key => state.materials.materialData.data[key])
//            .map(materialData => {
//                return materialData.outputRecipes
//                    .filter(outputRecipe => outputRecipe.inputs.length === 0 && outputRecipe.outputs.length > 0)
//                    .map(outputRecipe => {
//                        var buildingTicker = state.production.reactorData.results[outputRecipe.reactorId];
//                        return outputRecipe.outputs.map(output => {
//                            return { 
//                                key: `${buildingTicker}-${outputRecipe.outputs[0].material.ticker}`,
//                                material: output.material.ticker,
//                                amount: output.amount,
//                            };
//                        });
//                    })
//            })
//            .reduce((obj, x) => obj.concat(x), [])
//            .reduce((obj, x) => obj.concat(x), []);

        var moreRecipeData = Object.keys(state.materials.materialData.data)
            .map(key => state.materials.materialData.data[key])
            .map(materialData => {
                return materialData.outputRecipes
                    .filter(outputRecipe => outputRecipe.inputs.length === 0 && outputRecipe.outputs.length > 0)
                    .map(outputRecipe => {
                        var buildingTicker = state.production.reactorData.results[outputRecipe.reactorId];
                        return { buildingTicker, outputRecipe };
                    })
            })
            .reduce((obj, x) => obj.concat(x), []);

        var moreRecipes = moreRecipeData
            .map(recipeData => {
                return recipeData.outputRecipe.outputs.map(output => {
                    return { 
                        key: `${recipeData.buildingTicker}-${recipeData.outputRecipe.outputs[0].material.ticker}`,
                        building: recipeData.buildingTicker,
                        duration: recipeData.outputRecipe.duration.millis / 1000,
                    };
                });
            })
            .reduce((obj, x) => obj.concat(x), []);

        var moreRecipeOutputs = moreRecipeData
            .map(recipeData => {
                return recipeData.outputRecipe.outputs.map(output => {
                    return { 
                        key: `${recipeData.buildingTicker}-${recipeData.outputRecipe.outputs[0].material.ticker}`,
                        material: output.material.ticker,
                        amount: output.amount,
                    };
                });
            })
            .reduce((obj, x) => obj.concat(x), []);

        return {
            dataVersion: 'BUILDINGS-001',
            userInfo: {
                username: state.user.data.username,
                companyId: state.user.data.companyId,
                userId: state.user.data.id,
            },
            buildings,
            buildingCosts,
            buildingWorkforce,
            buildingRecipes: buildingRecipes.concat(moreRecipes),
            recipeInputs,
            recipeOutputs: recipeOutputs.concat(moreRecipeOutputs),
            moreRecipes,
            materials,
        };
    }
}

export { BuildingExtractor }


