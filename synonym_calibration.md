# Synonym Calibration Guide — Heteronym Puzzle Audit

## The Rule
Clue 1 = synonym of Answer (meaning A)
Clue 2 = synonym of Answer (meaning B, DIFFERENT from A)
Clue 1 ≠ synonym of Clue 2

## PASS Examples (these are correct)
| Answer | Clue 1 | Clue 2 | Why it passes |
|--------|--------|--------|---------------|
| Dash | Pinch | Sprint | Pinch = small amount of something (a dash of salt), Sprint = short run (a dash). True synonyms, different meanings. |
| Mint | Perfect | Coinage | Perfect = mint condition, Coinage = to mint coins. True synonyms, different meanings. |
| Tear | Rip | Drop | Rip = to tear, Drop = a teardrop. True synonyms, different meanings. |
| Light | Bright | Weightless | Bright = light/illumination, Weightless = light (not heavy). True synonyms, different meanings. |
| Bark | Rind | Shout | Rind = tree bark, Shout = dog bark. True synonyms, different meanings. |

## FAIL Examples (these are wrong)
| Answer | Clue 1 | Clue 2 | Why it fails |
|--------|--------|--------|--------------|
| Dash | Hyphen | Sprint | Hyphen is NOT a synonym of dash. A hyphen (-) and dash (—) are different punctuation marks. Hyphen is a TYPE of which dash is one variety. Category/hyponym fail. ❌ |
| Sow | Plant | Hog | Plant IS a synonym of sow (verb: to plant seeds) ✅. But Hog is NOT a synonym of sow (noun: female pig). Hog = any pig, sow = specific female pig. Hyponym fail. ❌ |
| Crane | Bird | Lift | Bird IS NOT a synonym of crane (bird is a category, crane is specific). Lift IS NOT a synonym of crane (lift is a device, crane is a specific type). Both are categories/related concepts. ❌ |
| Mint | Herb | Coin | Herb is NOT a synonym of mint (mint IS an herb = category fail). Coin IS NOT a synonym of mint (mint = place that MAKES coins, product-to-source fail). ❌ |
| Bark | Tree | Shout | Tree is NOT a synonym of bark (bark is part of a tree = part-whole fail). ❌ |

## Common Failure Patterns (MEMORIZE THESE)
1. **Category/Hypernym** (X IS a Y, but Y is not X): Bird→Crane, Mammal→Bat, Insect→Fly, Rodent→Mouse, Container→Box, Jewelry→Ring, Metal→Iron
2. **Part-Whole** (X is part of Y): Tree→Bark, Feather→Wing, Cards→Deck, Nucleus→Cell
3. **Action-Instrument** (X does Y with Z): Write→Pen, Swim→Pool, Keyboard→Type
4. **Product-Source** (X is made at Y): Coin→Mint, Currency→Mint, Wine→Port
5. **Associated concept** (X is related to Y but not a synonym): Ocean→Wave, Lightning→Bolt, Galaxy→Space
6. **Wrong species** (different things): Trout→Bass, Planet→Star, Cow→Bull

## Expanded PASS examples showing borderline cases
| Answer | Clue 1 | Clue 2 | Why PASS |
|--------|--------|--------|----------|
| Bat | Stick | Flutter | Stick = baseball bat (they're called "the stick" in sports), Flutter = to bat (flutter eyelashes/bat wings). Slightly loose but both are genuine alternate usages. |
| Stool | Seat | Feces | Seat = stool (piece of furniture), Feces = stool (medical term). ✅ True synonyms in their domains. |
| Well | Healthy | Shaft | Healthy = well (adjective: I am well), Shaft = well (noun: water well). ✅ True synonyms, different meanings. |
| Fly | Soar | Insect | Soar = to fly, Insect = a fly. "Insect" IS a category but FLY is a specific insect which HAS NO TRUE SYNONYM — accepting this as the best available. |
| Duck | Dodge | Fowl | Dodge = to duck, Fowl = a duck (fowl IS a category, but duck as a noun has no synonym, accept Fowl as the best available). |

## Your Task
Read the CSV at /root/heteronym/backend/puzzles.csv. For EACH of the ~90 puzzles assigned to you, check BOTH clues against this calibration. Be AGGRESSIVE in flagging — if you're unsure, FLAG IT. Better to flag and have me review than miss a bad clue.

After checking, write a CSV file at /root/flagged_<your_number>.csv with:
Answer,Clue 1,Clue 2,Issue,Fix Suggestion
