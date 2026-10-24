/* Verify the live recipe model against the October 2026 book tables. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const model = require('../assets/js/salad-cards.js');
const reference = JSON.parse(fs.readFileSync('downloads/reference/project100-analysis-data.json', 'utf8'));
// Encyclopedia V3.3 PDF pages 13–14: no-dressing, whole prepared recipes.
const expected = [
 [312,532,18,30],[179,329,10,19],[316,542,17,28],[238,380,40,61],
 [538,858,51,80],[448,706,46,70],[368,620,27,45],[380,640,26,43],
 [530,842,51,79],[237,404,12,19],[312,527,16,27],[516,696,35,44],
 [611,948,41,61],[454,717,46,70]
];
assert.equal(model.recipes.length, 14);
model.recipes.forEach((recipe, i) => {
 const totals = model.totals(recipe, 'none');
 assert.deepEqual([totals[0][0], totals[1][0], totals[0][1], totals[1][1]].map(model.roundBook), expected[i], `N${i+1}`);
 const saved = reference.salad_model.recipes[i];
 assert.equal(saved.id, recipe.id);
 for (const [mode, key] of [['none','base'],['heavy','heavy'],['light','light']]) {
  const current=model.totals(recipe,mode), published=saved.nutrition[key];
  current.forEach((row,end)=>row.forEach((value,n)=>assert.ok(Math.abs(value-published[end][n])<0.00001,`${recipe.id}/${mode}/${end}/${n}`)));
 }
 assert.equal(model.eggCount(recipe), saved.eggCount);
});
for (const [mode,kcal,fat] of [['heavy',[456,691],[47.1,71.4]],['light',[617,865],[54.6,68.2]]]) {
 assert.deepEqual([0,1].map(end=>Math.round(model.dressing(mode,end)[0])),kcal);
 assert.deepEqual([0,1].map(end=>model.roundBook(model.dressing(mode,end)[3]*10)/10),fat);
}
// The browser module stores the nine caption stories as JSON; read without executing UI code.
const mealSource=fs.readFileSync('assets/js/meal-stories.js','utf8');
const meals=JSON.parse(mealSource.match(/const meals=(\[.*?\]);/s)[1]);
assert.equal(meals.length,9);
meals.forEach((meal,i)=>{
 for(const key of ['name','basis','macros','ingredients','notes'])assert.deepEqual(meal[key],reference.meal_stories[i][key],`${i}/${key}`);
});
console.log('PASS: 14 salad ranges, both whole-batch dressings, egg rules and nine caption story bases remain preserved in the dated reference dataset. These legacy salad models are retired from current book content.');
