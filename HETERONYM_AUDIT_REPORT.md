# Heteronym Puzzle Audit Report — Strict Synonym Test

**Date:** June 1, 2026  
**File audited:** `/root/heteronym/backend/puzzles.csv`  
**Total puzzles:** 108  
**Passed:** 52 (48.1%)  
**Flagged:** 56 (51.9%)  

---

## Method

Each of the 108 puzzles was tested against three rules:

1. **Clue 1 is a true synonym** of the Answer for one of its meanings  
2. **Clue 2 is a true synonym** of the Answer for a *different* meaning  
3. **Clue 1 and Clue 2 are NOT synonyms** of each other  

A "true synonym" means the clue word can be swapped with the answer word in context and mean the same thing. The following are **NOT** synonyms:
- **Hypernyms/categories** ("Bird" for "Crane" — crane IS a bird, but they're not interchangeable)
- **Hyponyms** ("Winter" for "Season" — winter is one type of season)
- **Part-whole relationships** ("Tree" for "Bark" — bark is part of a tree)
- **Action-instrument** ("Write" for "Pen" — a pen is used to write)
- **Action-location** ("Swim" for "Pool" — you swim in a pool)
- **Related concepts** ("Ocean" for "Wave" — waves occur in oceans)
- **Phrases** ("Not heavy" for "Light" — that's a definition, not a synonym)

---

## FLAGGED PUZZLES (56 total)

### 1. Line 2: Dash | Punctuation / Sprint
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — "Punctuation" is a category. A dash IS a punctuation *mark*, but "punctuation" is the class (dash, comma, period are all punctuation). You wouldn't say "Insert a punctuation" instead of "Insert a dash." |
| Clue 2 → Answer? | ✅ PASS — "Sprint" is a synonym for a short dash/run. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Hyphen"** (a dash is a type of hyphen/em-dash; they are true synonyms in the punctuation sense) |

### 2. Line 5: Light | Bright / Not heavy
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — "Bright" is a synonym for light (illumination). |
| Clue 2 → Answer? | **FAIL** — "Not heavy" is a **phrase/definition**, not a synonym. The clue must be a single word that can swap with "light" in context. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Weightless"** or **"Featherweight"** (true synonyms for light = not heavy) |

### 3. Line 9: Sow | Plant / Pig
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To sow means to plant (verb meaning). |
| Clue 2 → Answer? | **FAIL** — A sow (female pig) IS a pig, but "pig" is a hypernym/category. They are not interchangeable synonyms. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Swine"** (swine is a general term for pigs, including sows; more aligned as a synonym) or **"Boar"** (opposite gender but at least in the same domain — though "boar" is also a specific type). Actually best: **"Hog"** (can mean any pig including a sow in common usage). |

### 4. Line 10: Spring | Leap / Season
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To spring means to leap/jump. |
| Clue 2 → Answer? | **FAIL** — Spring IS a season, but "season" is a hypernym/category. Spring, summer, fall, winter are types of seasons. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Springtime"** (a direct synonym for the season) or swap with **"Coil"** for the coil/spring meaning. |

### 5. Line 11: Tear | Rip / Cry
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To tear means to rip. |
| Clue 2 → Answer? | **FAIL** — A "tear" (teardrop) is the drop of fluid. "Cry" is the *action* of producing tears. You cry *tears* — they are not interchangeable. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Teardrop"** or **"Drop"** |

### 6. Line 12: Box | Fight / Container
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To box means to fight with fists. |
| Clue 2 → Answer? | **FAIL** — A box is a type of container. "Container" is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Crate"** (a box and a crate are interchangeable synonyms for a storage container) or **"Carton"** |

### 7. Line 15: Capital | Money / City
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Capital can mean money/financial assets. |
| Clue 2 → Answer? | **FAIL** — A capital IS a city (seat of government), but "city" is a hypernym. Not all cities are capitals. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Seat"** (seat of government) or **"Metropolis"** (chief city) |

### 8. Line 17: Object | Thing / Oppose
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — An object IS a thing, but "thing" is the broadest possible hypernym. They are not interchangeable synonyms in any precise sense. |
| Clue 2 → Answer? | ✅ PASS — To object means to oppose. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Item"** (a true synonym for an object/article) or **"Artifact"** |

### 9. Line 19: Racket | Noise / Sport
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A racket can mean a loud noise/din. |
| Clue 2 → Answer? | **FAIL** — A racket is sports equipment used in tennis/badminton. "Sport" is the activity, not a synonym for the equipment. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Paddle"** (a racket is a type of paddle used in racquet sports) |

### 10. Line 20: Bat | Mammal / Club
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A bat (animal) IS a mammal. "Mammal" is a biological class/hypernym. |
| Clue 2 → Answer? | **FAIL** — A baseball bat is a type of club (hitting implement). "Club" is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Chiropteran"** (too obscure) — better: keep as is or use **"Flying"** loosely. Actually, no true single-word synonym exists for "bat" as an animal. **Recommend:** Clue 2 → **"Stick"** (a bat is a stick used to hit a ball) — then it works. For Clue 1, use **"Nocturnal"** as a strong hint. Actually neither is a synonym. Let me think... For the animal, "bat" has no synonym. Best to keep "Mammal" as a category hint since the game allows it, OR replace Clue 1 with **"Vampire"** (linking to the bat's association with vampires). Actually for a synonym-based approach: Clue 1 → **"Stick"** (bat = stick for hitting), Clue 2 → **"Flutter"** (bat = to flutter/flap) |

### 11. Line 21: Crane | Bird / Lift
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A crane (animal) IS a bird. "Bird" is a category/hypernym. |
| Clue 2 → Answer? | **FAIL** — A crane (machine) is a lifting device. "Lift" is a generic verb/noun. A crane is a type of lifting machine, so "lift" is a hypernym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Heron"** (a heron is a similar wading bird; in some contexts interchangeable with crane) — OR replace with **"Stretch"** (to crane one's neck means to stretch). Clue 2 → **"Hoist"** (a hoist is a direct synonym for a crane/lifting machine) |

### 12. Line 23: Well | Spring / Fine
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A well is a man-made water shaft; a spring is a natural water source. Related but not synonyms. |
| Clue 2 → Answer? | ✅ PASS — "Fine" means well/good in the sense of health. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Borehole"** (too technical) — better: **"Waterhole"** or restructure to **"Healthy"** (for the adjective meaning) and **"Shaft"** (for the noun meaning) |

### 13. Line 25: Wave | Motion / Ocean
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A wave IS a type of motion. "Motion" is a hypernym/category. |
| Clue 2 → Answer? | **FAIL** — Waves occur in the ocean, but "ocean" is the body of water, not a synonym for "wave." |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Swell"** (a swell is a wave in the ocean). Clue 2 → **"Gesture"** (to wave means to gesture) |

### 14. Line 28: Pound | Hit / Weight
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To pound means to hit/strike. |
| Clue 2 → Answer? | **FAIL** — A pound is a *unit of* weight. "Weight" is the physical property being measured, not a synonym for the unit. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Libra"** (the Latin term for pound) or **"Unit"** (too generic). Better: **"Ounce"** (like "inch" for foot, it's a related unit — though still not a direct synonym). Best: **"Poundage"** or keep as a definition hint. Actually simplest fix: Clue 2 → **"Thump"** (to pound can mean to thump) — with Clue 1 "Hit" that's two hitting synonyms, which fails the different-meaning test. So: restructure to Clue 1 = **"Thump"** (verb), Clue 2 = **"Libra"** (unit). |

### 15. Line 29: Can | Container / Able
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A can is a type of container. "Container" is a hypernym/category. |
| Clue 2 → Answer? | ✅ PASS — "Can" meaning able to (modal verb). Actually "can" = "able" in the sense of being capable. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Tin"** (a can is a tin container; "tin" and "can" are interchangeable for metal food containers) |

### 16. Line 33: Mold | Form / Fungus
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To mold means to form/shape. |
| Clue 2 → Answer? | **FAIL** — Mold IS a type of fungus. "Fungus" is the biological kingdom/hypernym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Mildew"** (mildew IS a type of mold/fungus — they are very closely related and often used interchangeably in common speech) or **"Mustiness"** |

### 17. Line 36: Right | Correct / Entitled
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Right can mean correct. |
| Clue 2 → Answer? | **FAIL** — "Right" (noun) = entitlement. "Entitled" (adjective) = having a right. Different part of speech. "Entitled" is not a synonym for the noun "right." |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Entitlement"** (a right IS an entitlement) or **"Privilege"** |

### 18. Line 37: Bass | Low / Trout
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Bass can mean low frequency/deep sound. |
| Clue 2 → Answer? | **FAIL** — Trout and bass are **different** species of fish. This is not a synonym — it's simply wrong. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Fish"** (still a hypernym, but at least correctly points to the fish meaning). Better: **"Perch"** (another fish, though still different). Best approach: Clue 2 → **"Largemouth"** (a type of bass). Actually no — just use **"Fish"** as the clearest hint. |

### 19. Line 42: Scale | Climb / Measure
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To scale means to climb. |
| Clue 2 → Answer? | **FAIL** — A scale IS a measuring device (for weighing). "Measure" (as noun) is a hypernym/category of all measuring instruments. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Weigh"** (to scale means to weigh, i.e., determine the weight of something) or **"Balance"** (a balance IS a scale) |

### 20. Line 45: Address | Speech / Location
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — An address can be a speech. |
| Clue 2 → Answer? | **FAIL** — An address IDENTIFIES a location but is not the location itself. "Location" is a broader concept. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Residence"** (an address indicates a residence) or **"Dwelling"** |

### 21. Line 49: Bark | Tree / Shout
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — Bark is the outer covering of a tree. "Tree" is the whole plant, "bark" is the part. They are not interchangeable. |
| Clue 2 → Answer? | ✅ PASS — To bark means to shout. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Rind"** (a direct synonym for the outer covering/cortex of a plant) or **"Cortex"** |

### 22. Line 50: Lead | Guide / Metal
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — To lead means to guide. |
| Clue 2 → Answer? | **FAIL** — Lead IS a metal. "Metal" is a material category/hypernym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Plumbum"** (the Latin name for lead, source of symbol Pb) — or better, **"Pencil"** (pencil "lead" is actually graphite, but strongly associated) or **"Toxic"** (lead is toxic, but that's a property). Best: **"Heavy"** (lead is a heavy metal). Actually simplest: **"Plumb"** (relating to lead/plumbing). |

### 23. Line 51: Ruler | Monarch / Measure
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A ruler can be a monarch/sovereign. |
| Clue 2 → Answer? | **FAIL** — A ruler IS a measuring tool. "Measure" (noun for measuring instrument) is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Yardstick"** (a yardstick IS a type of ruler/measuring stick) or **"Scale"** |

### 24. Line 53: Ring | Band / Jewelry
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A ring is a band worn on a finger. |
| Clue 2 → Answer? | **FAIL** — A ring IS a type of jewelry. "Jewelry" is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Gem"** or **"Circle"** (a ring is a circle) — "Circle" would work for the shape meaning of ring. |

### 25. Line 56: Fly | Insect / Soar
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A fly IS a type of insect. "Insect" is a biological class/hypernym. |
| Clue 2 → Answer? | ✅ PASS — To fly means to soar. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Housefly"** (redundant) — better: **"Buzz"** (a fly buzzes, and to fly can also mean to buzz through the air). Actually, "buzz" is associated but not a synonym. Best: keep "Insect" as a category since there's no true synonym for "fly" as an animal. |

### 26. Line 57: Foot | Ankle / Inch
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — The ankle is the joint connecting the foot to the leg. Adjacent body parts, not synonyms. |
| Clue 2 → Answer? | **FAIL** — A foot is a unit of length equal to 12 inches. "Inch" is a different (smaller) unit, not a synonym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Toe"** (body part: your foot has toes; not a synonym but closer than ankle). Actually, there's no synonym for foot (body part). Clue 2 → **"Yard"** (a yard is 3 feet — different unit, same problem). Best: restructure to Clue 1 = **"Toe"** (foot has toes — association), Clue 2 = **"Yard"** (unit of 3 feet). Neither is a true synonym. Better approach: Clue 1 = **"Paw"** (animal foot synonym), Clue 2 = **"Pace"** (foot as a unit of measurement = a pace) |

### 27. Line 59: Hammer | Mallet / Pound
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A mallet is a *type* of hammer (typically wooden). Hyponym, not a synonym. |
| Clue 2 → Answer? | ✅ PASS — To hammer means to pound. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Sledge"** (a sledge is a type of heavy hammer — same issue). Better: **"Tool"** is too generic. Just restructure: Clue 1 = **"Pound"** (verb), Clue 2 = **"Sledge"** (noun, a type of hammer). Or replace Clue 1 with **"Mallet"** as-is (since in many contexts mallet and hammer are used interchangeably, though technically a mallet is a subset) |

### 28. Line 60: Iron | Steel / Press
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — Iron and steel are different metals. Steel is an alloy made *from* iron + carbon. Not interchangeable. |
| Clue 2 → Answer? | ✅ PASS — To iron means to press (clothes). |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Metal"** (still a category, but iron IS a metal). Better: **"Ferrum"** (Latin for iron, source of Fe) or **"Branding"** (to iron can mean to brand). Actually: Clue 1 → **"Brand"** (to iron can mean to brand with a hot iron) |

### 29. Line 62: Mouse | Rodent / Cursor
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A mouse IS a rodent. "Rodent" is the mammalian order/hypernym. |
| Clue 2 → Answer? | **FAIL** — A computer mouse controls a cursor. "Cursor" is what the mouse moves, not a synonym for the device. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → no synonym for mouse (animal). Clue 2 → **"Tracker"** or **"Pointer"** (a mouse IS a pointing/tracking device). Clue 1 → keep "Rodent" as category. Or restructure to Clue 1 = **"Squeak"** (sound a mouse makes), Clue 2 = **"Click"** (action of a computer mouse). Neither is a synonym though. Best: Clue 1 → **"Rodent"** (accept category), Clue 2 → **"Pointer"** (synonym for computer mouse) |

### 30. Line 64: Park | Garden / Leave
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A park is a public green space. A garden is a cultivated planting area. Related but not synonymous. |
| Clue 2 → Answer? | **FAIL** — To "park" means to temporarily stop a vehicle. To "leave" means to depart. Related but not synonymous. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Common"** (a park is a common/green). Better: Clue 1 → **"Green"** (a park is a green space). Clue 2 → **"Stop"** (to park means to stop and leave a vehicle) |

### 31. Line 65: Pen | Write / Enclosure
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — "Write" is the action performed WITH a pen. Action-instrument relationship, not a synonym. |
| Clue 2 → Answer? | ✅ PASS — A pen can be an enclosure for animals. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Quill"** (a quill is a type of pen/feather pen — true synonym for the writing instrument) |

### 32. Line 68: Port | Harbor / Wine
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A port is a harbor. |
| Clue 2 → Answer? | **FAIL** — Port IS a type of fortified wine. "Wine" is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Ruby"** (port is a ruby-colored wine; "Ruby" as a wine descriptor) or **"Vintage"** (port is associated with vintage) |

### 33. Line 70: Range | Scope / Oven
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Range can mean scope/extent. |
| Clue 2 → Answer? | **FAIL** — A kitchen range includes a cooktop and an oven. "Oven" is just the baking compartment (part-whole). |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Stove"** (a range IS a stove — stove and range are interchangeable terms for the cooking appliance) |

### 34. Line 73: Season | Winter / Flavor
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — Winter is a type/instance of season. Hyponym, not a synonym. |
| Clue 2 → Answer? | ✅ PASS — To season means to add flavor. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Period"** (a season is a period of the year) or **"Term"** |

### 35. Line 74: Sink | Basin / Drown
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A sink is a basin. |
| Clue 2 → Answer? | **FAIL** — To sink means to descend below the surface. To drown means to die from suffocation underwater. Drowning is a possible consequence of sinking, not a synonym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Descend"** (to sink means to descend/drop) or **"Plummet"** |

### 36. Line 75: Space | Room / Galaxy
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Space can mean room/area. |
| Clue 2 → Answer? | **FAIL** — Outer space contains galaxies. "Galaxy" is an object within space, not a synonym for "space." |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Void"** (space = the void of the universe) or **"Cosmos"** (space = the cosmos) |

### 37. Line 77: Star | Celebrity / Planet
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A star can be a celebrity. |
| Clue 2 → Answer? | **FAIL** — A star and a planet are fundamentally different celestial bodies. This is not a synonym — it's a different object. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Sun"** (a star is a sun/sun-like body) or **"Asterisk"** (star symbol) |

### 38. Line 80: Table | Desk / Chart
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A desk is a type of table designed for writing. Hyponym, not a synonym. |
| Clue 2 → Answer? | ✅ PASS — A table can be a chart/data arrangement. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Bench"** (a bench is a type of table — same issue actually). Better: Clue 1 → **"Stand"** (a table is a stand/surface) |

### 39. Line 81: Chip | Microchip / Crisp
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A chip can be a microchip. |
| Clue 2 → Answer? | **FAIL** — In American English, "chip" (potato chip) is NOT called a "crisp." "Crisp" is an adjective meaning crunchy. In British English, "crisps" = American "chips." Regional mismatch. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Snack"** (a chip is a snack food) — still a category. Better: **"French fry"** (British "chips" = American "french fries") — also regional. Best: **"Pringle"** (a brand of chips) — too specific. Just use **"Snack"** as the most universally understood clue for the food meaning. |

### 40. Line 83: Coach | Trainer / Bus
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A coach is a trainer. |
| Clue 2 → Answer? | **FAIL** — A coach IS a type of bus (luxury motor coach). "Bus" is a hypernym/category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Carriage"** (a coach is a horse-drawn carriage — true synonym for the traditional meaning) |

### 41. Line 86: Temple | Church / Forehead
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A temple is a place of worship (synonym for church/shrine in broad sense). |
| Clue 2 → Answer? | **FAIL** — The temple is the side of the head. The forehead is the front of the head above the brows. Adjacent but distinct areas. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Skull"** (the temple is part of the skull) — still part-whole. Better: **"Shrine"** (swap — make Clue 1 = "Shrine", Clue 2 = "Church", both point to the same meaning). Actually: Clue 2 → **"Sideburn"** area. Best: **"Cranium"** (temple is a region of the cranium) — or just **"Head"** (temple is a part of the head — still not a synonym). There's no true synonym for "temple" as a head region. Best fix: restructure to Clue 1 = **"Shrine"** (place of worship), Clue 2 = **"Synagogue"** (another type of worship place — no, same meaning). Actually both "Church" and "Forehead" need replacement. Try: Clue 1 = **"Shrine"**, Clue 2 = **"Prayer"** (related). Hmm. Best: Clue 1 = **"Shrine"**, Clue 2 = **"Cranium"**. |

### 42. Line 89: Train | Railway / Teach
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A train runs on a railway. "Railway" is the infrastructure/track, "train" is the vehicle. Not interchangeable. |
| Clue 2 → Answer? | ✅ PASS — To train means to teach. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Locomotive"** (a train IS a locomotive — true synonym for the vehicle) |

### 43. Line 90: Trunk | Chest / Snout
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A trunk can be a chest/storage box. |
| Clue 2 → Answer? | **FAIL** — An elephant's trunk IS a type of snout/proboscis. "Snout" is a broader category. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Proboscis"** (a trunk IS a proboscis — true synonym) |

### 44. Line 91: Type | Kind / Keyboard
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — Type can mean kind/variety. |
| Clue 2 → Answer? | **FAIL** — To type means to input text using a keyboard. "Keyboard" is the instrument, not a synonym for the action. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Key"** (to type = to key in data) or **"Keyboard"** is fine if the game allows instrument-for-action clues. Strictly: **"Input"** |

### 45. Line 95: Wing | Feather / Squadron
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — Feathers are parts of a wing. Part-whole relationship, not a synonym. |
| Clue 2 → Answer? | ✅ PASS — A wing can be a squadron/military unit. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Pinion"** (a pinion IS the outer part of a wing — "pinion" and "wing" are somewhat interchangeable for a bird's wing) |

### 46. Line 97: Stool | Chair / Feces
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A stool IS a type of chair (backless/armless). "Chair" is a hypernym/category. |
| Clue 2 → Answer? | ✅ PASS — Stool can mean feces. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Seat"** (a stool is a seat — true synonym for the furniture) or **"Stool" synonyms are rare. "Ottoman" is a type of stool. "Stool" as a seat = "seat" works. |

### 47. Line 98: Wood | Grove / Lumber
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A grove IS a small wood/forest. "Grove" is a specific type of woodland (hyponym). |
| Clue 2 → Answer? | ✅ PASS — Wood can mean lumber/timber. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Forest"** (wood = forest — true synonym for the wooded area meaning) |

### 48. Line 99: Pool | Swim / Carpool
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — "Swim" is the activity performed in a pool. Action-location, not a synonym. |
| Clue 2 → Answer? | **FAIL** — "Carpool" is a specific type of pooling/ridesharing arrangement. Hyponym, not a synonym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Puddle"** (too small) or **"Lake"** (too large) — no. **"Reservoir"** (a pool can be a reservoir/large body of water). Clue 2 → **"Combine"** or **"Share"** (to pool means to combine/share resources). |

### 49. Line 100: Lap | Knee / Circuit
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — The lap is the area formed by the thighs when sitting. The knee is a joint below the lap. Adjacent but not synonymous. |
| Clue 2 → Answer? | ✅ PASS — A lap can be a circuit (of a racetrack). |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Thigh"** (the lap area is on the thighs — part-whole again). Better: **"Sitting"** area? There's no true synonym for "lap" as a body area. Best: **"Kneel"** or just use "Knee" as an accepted loose association. For a synonym: "Lap" as body area has no synonym. Accept the association. |

### 50. Line 102: Duck | Bird / Dodge
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A duck IS a bird. "Bird" is a hypernym/category. |
| Clue 2 → Answer? | ✅ PASS — To duck means to dodge. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Mallard"** (a mallard IS a type of duck — hyponym). Better: no true synonym. Use **"Fowl"** (a duck IS fowl/waterfowl — still a category). Best to accept "Bird" as a category since no synonym exists. |

### 51. Line 103: Mint | Herb / Coin
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — Mint IS an herb. "Herb" is a category/hypernym (as per user's own example). |
| Clue 2 → Answer? | **FAIL** — A mint is a place where coins are made. "Coin" is the product. Also "mint" (slang) means lots of money, not a coin. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Spearmint"** (spearmint IS a type of mint — hyponym). Actually: **"Peppermint"** (specific type). Better: "Mint" the plant has no real synonym. Clue 2 → **"Make"** or **"Manufacture"** (to mint means to coin/manufacture money). Best: Clue 1 = **"Peppermint"** (a type of mint, but used almost interchangeably), Clue 2 = **"Coinage"** (minting is coinage production). |

### 52. Line 104: Deck | Cards / Floor
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A deck IS a set/pack of cards. "Cards" are the individual items within a deck (part-whole). |
| Clue 2 → Answer? | ✅ PASS — A deck can be a floor/platform. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Pack"** (a deck of cards IS a pack of cards — true synonym) |

### 53. Line 105: Cell | Jail / Nucleus
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A cell can be a jail cell/prison cell. |
| Clue 2 → Answer? | **FAIL** — The nucleus is an organelle INSIDE a biological cell. Part-whole, not a synonym. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Cytoplasm"** (still part-whole) — better: **"Organism"** (too broad). **"Battery"** (a cell is a battery/electrochemical cell) |

### 54. Line 106: Bolt | Lightning / Fasten
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A bolt IS a lightning discharge. "Lightning" is the broader phenomenon. A bolt is a type of lightning. |
| Clue 2 → Answer? | ✅ PASS — To bolt means to fasten. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Thunderbolt"** (a thunderbolt IS a bolt of lightning) or **"Flash"** (a bolt is a flash of lightning) |

### 55. Line 107: Bridge | Span / Card
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | ✅ PASS — A bridge is a span. |
| Clue 2 → Answer? | **FAIL** — Bridge IS a card game. "Card" is the playing piece used in the game, not a synonym for the game. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 2 → **"Contract"** (Contract Bridge is the full name — the game's proper term, though "Contract" is also a separate puzzle answer). Or **"Whist"** (bridge evolved from whist). Best: **"Rubber"** (a rubber is a unit of play in bridge — too specialized). Accept as-is or use **"Game"** as category. |

### 56. Line 108: Bull | Cow / Market
| Rule | Result |
|------|--------|
| Clue 1 → Answer? | **FAIL** — A bull is a male bovine. A "cow" specifically means a female bovine. They are distinct genders. Not interchangeable. |
| Clue 2 → Answer? | **FAIL** — "Bull market" is a rising financial market. "Market" is the broader concept, "bull" is the market sentiment. Not interchangeable. |
| Clues ≠ each other? | ✅ PASS |
| **Suggested fix:** | Clue 1 → **"Ox"** (a bull is a type of ox/bovine — closer than "cow" for male). Or **"Bovine"** (still a category). **"Steer"** (castrated male) — not right either. Best: **"Ox"** (male ox = bull in some contexts). Clue 2 → **"Charge"** (a bull charges; "charge" appears elsewhere — but "to bull" means to charge/force) or **"Rush"** (a bull rushes/moves aggressively). Actually: Clue 2 → **"Speculator"** (a bull is a financial speculator who expects prices to rise) |

---

## SUMMARY

| Metric | Count |
|--------|-------|
| **Total puzzles** | 108 |
| **PASSED (all rules)** | 52 (48.1%) |
| **FLAGGED (≥1 rule fails)** | 56 (51.9%) |
| Clue 1 failures only | 18 |
| Clue 2 failures only | 27 |
| Both clues fail | 11 |
| Mutual synonym failures | 0 |

### Most common failure modes:
1. **Category/hypernym** (Clue IS-A category of Answer): ~28 occurrences — e.g., Bird→Crane, Mammal→Bat, Herb→Mint, Container→Box
2. **Part-whole** (Clue is a part of Answer or vice versa): ~8 occurrences — e.g., Tree→Bark, Feather→Wing, Cards→Deck
3. **Related/associated concept** (Clue is associated but not interchangeable): ~10 occurrences — e.g., Ocean→Wave, Lightning→Bolt, Galaxy→Space
4. **Action-instrument/location** (Clue is what you do with/at Answer): ~6 occurrences — e.g., Write→Pen, Swim→Pool
5. **Wrong species/object**: ~3 occurrences — Trout→Bass, Planet→Star
6. **Phrase instead of synonym**: 1 occurrence — "Not heavy" for Light

### Complete list of flagged answers (56):
Dash, Light, Sow, Spring, Tear, Box, Capital, Object, Racket, Bat, Crane, Well, Wave, Pound, Can, Mold, Right, Bass, Scale, Address, Bark, Lead, Ruler, Ring, Fly, Foot, Hammer, Iron, Mouse, Park, Pen, Port, Range, Season, Sink, Space, Star, Table, Chip, Coach, Temple, Train, Trunk, Type, Wing, Stool, Wood, Pool, Lap, Duck, Mint, Deck, Cell, Bolt, Bridge, Bull
