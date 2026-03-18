// API documentation: https://www.thecocktaildb.com/api.php

import path from 'path';
import fs from 'fs/promises';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

function getIngredients(drink) {
  const lines = [];
  for (let i = 1; i <= 15; i++) {
    const ingredientKey = 'strIngredient' + i;
    const measureKey = 'strMeasure' + i;

    const ingredientRaw = drink[ingredientKey];
    const measureRaw = drink[measureKey];

    let ingredient = '';
    let measure = '';

    if (ingredientRaw) {
      ingredient = ingredientRaw.trim();
    }
    if (measureRaw) {
      measure = measureRaw.trim();
    }
    if (ingredient !== '') {
      let line = '- ';
      if (measure !== '') {
        line = line + measure + ' ';
      }
      line = line + ingredient;
      lines.push(line);
    }
  }
  return lines.join('\n');
}

  function formatAlcoholicDrink(drink) {
    if (drink.strAlcoholic === 'Alcoholic') {
      return 'Yes';
    }
    return 'No';
  }

  function formatDrinkMarkdown(drink) {
    const lines = [];

    lines.push(`## ${drink.strDrink}`);
    lines.push('');
    lines.push(`![${drink.strDrink}](${drink.strDrinkThumb}/medium)`);
    lines.push('');
    lines.push(`**Category**: ${drink.strCategory}`);
    lines.push('');
    lines.push(`**Alcoholic**: ${formatAlcoholicDrink(drink)}`);
    lines.push('');
    lines.push(`### Ingredients`);
    lines.push('');
    lines.push(getIngredients(drink));
    lines.push('');
    lines.push(`### Instructions`);
    lines.push('');
    lines.push(drink.strInstructions);
    lines.push('');
    lines.push(`Served in:  ${drink.strGlass}`);

    return lines.join('\n');
  }

  function formatMarkdown(drinks) {
    const lines = [];
    lines.push('# Cocktail Recipes');
    lines.push('');

    for ( let i = 0; i < drinks.length; i++) {
      lines.push(formatDrinkMarkdown(drinks[i]));

      if (i < drinks.length - 1) {
        lines.push('---');
        lines.push('');
      }
    }

    return lines.join('\n');
  }

async function main() {
  if (process.argv.length < 3) {
    console.error('Please provide a cocktail name as a command line argument.');
    return;
  }

  const cocktailName = process.argv[2];
  const url = `${BASE_URL}/search.php?s=${cocktailName}`;

  const __dirname = import.meta.dirname;
  const outPath = path.join(__dirname, `./output/${cocktailName}.md`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch cocktail data');
    }

    const data = await response.json();

    if (!data.drinks) {
      throw new Error('No drinks found');
    }

    const markdownContent = formatMarkdown(data.drinks);

    await fs.writeFile(outPath, markdownContent, 'utf-8');

    console.log('Saved to: ' + outPath);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Do not change the code below
if (!process.env.VITEST) {
  main();
}
