# Product Requirements Document (PRD)

## Product Name (Working Title): BabyMeal Planner

## 1. Overview

BabyMeal Planner is a web application designed to help parents of 7-month-old babies plan and prepare balanced daily meals. The app generates a structured weekly calendar with lunch and dinner suggestions, ensuring nutritional variety, appropriate portion sizes, and adherence to Italian weaning practices.

The app provides parents with a reliable, ready-to-follow plan to reduce decision fatigue and ensure consistency during the weaning phase.

---

## 2. Problem Statement

Parents introducing solid foods often struggle with:

- Knowing what foods to introduce and when
- Ensuring a balanced and varied diet
- Planning meals consistently day-to-day
- Understanding correct portion sizes
- Avoiding repetition or nutritional gaps

This leads to stress, uncertainty, and inconsistent feeding practices.

---

## 3. Goals & Objectives

### Primary Goals

- Provide a ready-to-follow weekly meal calendar
- Ensure nutritionally balanced and varied meals
- Simplify daily decision-making

### Secondary Goals

- Save time on meal planning
- Build trust as a reliable parenting tool

---

## 4. Target Users

### Primary Users

- Parents of babies aged 7 months
- First-time parents

### Secondary Users

- Caregivers (grandparents, babysitters)

---

## 5. Key Features

### 5.1 Meal Calendar (Core Feature)

- Weekly calendar view (7 days)
- Each day includes:
  - Lunch
  - Dinner
- Meals are pre-generated and optimized for:
  - Nutritional balance
  - Variety
  - Age appropriateness (fixed at 7 months)

---

### 5.2 Meal Composition Logic

Each meal includes:

- Cereal cream (carbohydrates)
- Protein source
- Vegetables
- Extra virgin olive oil (always included)
- Broth (always included)

#### Protein Options:

- Chicken
- Turkey
- Fish
- Legumes
- Cheese
- Eggs (optional inclusion in rotation)

#### Example:

- Lunch:
  - Rice cream (20g)
  - Zucchini purée (40g)
  - Chicken (30g)
  - Extra virgin olive oil (5g)
  - Vegetable broth (150ml)
- Dinner:
  - Oat cream (20g)
  - Carrot + potato (50g)
  - Lentils (30g)
  - Extra virgin olive oil (5g)
  - Vegetable broth (150ml)

---

### 5.3 Automatic Variety System

The app ensures:

- Rotation of:
  - Cereals (rice, corn, oats, mixed grains)
  - Proteins (including eggs occasionally)
  - Vegetables (seasonal and diverse)
- No repetition patterns (e.g., same protein twice in a day)
- Weekly balance (e.g., fish 1–2 times/week, legumes multiple times/week, eggs limited frequency)

---

### 5.4 Portion Guidance

- Exact quantities per ingredient (grams/ml)
- Standardized for a 7-month-old baby

---

### 5.5 Meal Detail View

Each meal includes:

- Ingredients list with quantities

---

## 6. User Flow

### Onboarding

1. User downloads app
2. App directly presents a pre-generated weekly plan (no input required)

---

### Daily Use

1. User opens app
2. Views current day
3. Selects:
   - Lunch or dinner
4. Sees ingredients and quantities
5. Prepares meal

---

## 7. Functional Requirements

### FR1: Meal Generation Engine

- Generate weekly plans based on:
  - Nutritional rules
  - Variety constraints
  - Italian weaning guidelines
  - Fixed inclusion of olive oil and broth

### FR2: Calendar Interface

- Display meals clearly by day and time
- Allow navigation between weeks

### FR3: Meal Detail Page

- Show structured breakdown of ingredients and quantities

### FR4: Data Storage

- Store:
  - Meal templates
  - Ingredient database
  - Nutritional rules

---

## 8. Non-Functional Requirements

- Usability: Extremely simple UI (sleep-deprived parent friendly)
- Performance: Instant load of weekly plan
- Offline access: Meals accessible without internet

##

##

