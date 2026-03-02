# Momen - Component Color Examples

> Visual reference for implementing the Momen color palette

---

## Color Palette Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOMEN COLOR PALETTE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SLATE (Primary)     #355872   ████████████                    │
│  └─ Headers, Primary Buttons, Important Text                    │
│                                                                  │
│  SKY (Secondary)     #7AAACE   ████████████                    │
│  └─ Links, Secondary Buttons, Descriptions                      │
│                                                                  │
│  ICE (Accent)        #9CD5FF   ████████████                    │
│  └─ Highlights, Info Badges, Focus States                       │
│                                                                  │
│  CREAM (Background)  #F7F8F0   ████████████                    │
│  └─ Page Background, Table Rows (odd)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Buttons

### Primary Button
```
┌────────────────────────────────────────────┐
│          Upload Photo                      │  BG: #355872
└────────────────────────────────────────────┘  Text: #FFFFFF
                                               Hover: #2d4a61
```

### Secondary Button
```
┌────────────────────────────────────────────┐
│          Share Gallery                     │  BG: #7AAACE
└────────────────────────────────────────────┘  Text: #FFFFFF
                                               Hover: #6590b5
```

### Outline Button
```
┌────────────────────────────────────────────┐
│          Cancel                            │  BG: Transparent
└────────────────────────────────────────────┘  Text: #355872
                                               Border: #355872
```

### Ghost Button
```
          Learn More                           BG: Transparent
                                               Text: #355872
                                               Hover: BG #F7F8F0
```

---

## 2. Cards & Containers

### Event Card
```
┌──────────────────────────────────────────────────────────────┐
│ │                                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │  Company Annual Meeting  ┌────────┐                      ││
│ │  March 15, 2025          │  24    │  Photo count badge   ││
│ │                          └────────┘                      ││
│ │                                                          ││
│ │  ┌─────┐ ┌─────┐ ┌─────┐                               ││
│ │  │     │ │     │ │     │  Photo thumbnails              ││
│ │  └─────┘ └─────┘ └─────┘                               ││
│ │                                                          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                            │
│ Card BG: #FFFFFF                                           │
│ Border: rgba(122, 170, 206, 0.2)                           │
│ Shadow: 0 4px 6px rgba(53, 88, 114, 0.1)                   │
│ Title: #355872                                             │
│ Date: #7AAACE                                              │
└──────────────────────────────────────────────────────────────┘
```

### Stats Card
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│      156     │  │       12     │  │      89      │
│   Photos     │  │    Events    │  │   Guests     │
└──────────────┘  └──────────────┘  └──────────────┘

BG: #FFFFFF
Number: #355872
Label: #7AAACE
```

---

## 3. Tables

### Data Table
```
┌─────────────────────────────────────────────────────────────────┐
│ EVENT NAME              │ DATE       │ PHOTOS │ STATUS    │ CTN │
├─────────────────────────────────────────────────────────────────┤
│ Company Meeting         │ Mar 15     │ 156    │ Active    │ ⋯  │
├─────────────────────────────────────────────────────────────────┤
│ Birthday Party          │ Mar 20     │ 89     │ Active    │ ⋯  │
├─────────────────────────────────────────────────────────────────┤
│ Wedding Reception       │ Apr 01     │ 234    │ Ended     │ ⋯  │
└─────────────────────────────────────────────────────────────────┘

Header BG:          #355872
Header Text:        #FFFFFF
Row Even BG:        #FFFFFF
Row Odd BG:         #F7F8F0
Row Hover BG:       rgba(156, 213, 255, 0.1)
Border:             rgba(122, 170, 206, 0.2)
Text:               #355872
Secondary Text:     #7AAACE
```

### Status Badges
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Active  │  │  Ended   │  │ Pending  │  │  Error   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Active:   BG: #D1FAE5  Text: #059669
Ended:    BG: #F3F4E9  Text: #355872
Pending:  BG: #E1EFF9  Text: #50769C
Error:    BG: #FEE2E2  Text: #DC2626
```

---

## 4. Forms

### Input Field
```
┌──────────────────────────────────────────────────┐
│ Event Name                                       │
├──────────────────────────────────────────────────┤
│                                                  │
└──────────────────────────────────────────────────┘

Default:   BG: #FFFFFF  Border: rgba(122, 170, 206, 0.4)
Focus:     BG: #FFFFFF  Border: #9CD5FF  Ring: rgba(156, 213, 255, 0.4)
Error:     BG: #FFFFFF  Border: #EF4444
Disabled:  BG: rgba(247, 248, 240, 0.5)  Text: rgba(122, 170, 206, 0.4)
```

### Label & Helper Text
```
Event Name
────────────────────────────────────
The name that will be shown to guests

Label:    #355872
Helper:   #7AAACE
Error:    #EF4444
```

---

## 5. Navigation

### Top Header
```
┌──────────────────────────────────────────────────────────────┐
│  Momen        │ Events │ Gallery │ Settings │ Profile │     │
│               ─────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────┘

BG:          #355872
Logo:        #FFFFFF
Nav Link:    rgba(255, 255, 255, 0.7)
Nav Hover:   #FFFFFF
Nav Active:  #FFFFFF with bottom border
```

### Sidebar
```
┌─────────┐
│  Momen   │
├─────────┤
│         │
│ 📊 Dashboard  │
│   └──────────│
│         │
│ 📅 Events    │
│   └──────────│
│         │
│ 📷 Gallery   │
│   └──────────│
│         │
│ ⚙️ Settings  │
│   └──────────│
│         │
└─────────┘

BG:            #355872
Item (idle):   rgba(255, 255, 255, 0.7)
Item (hover):  rgba(255, 255, 255, 0.9)
Item (active): #FFFFFF BG: rgba(255, 255, 255, 0.1)
```

---

## 6. Alerts & Notifications

### Success Alert
```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Photo uploaded successfully!                               │
└──────────────────────────────────────────────────────────────┘

BG: rgba(16, 185, 129, 0.1)
Border: #10B981
Text: #059669
Icon: #10B981
```

### Error Alert
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ Failed to upload photo. Please try again.                  │
└──────────────────────────────────────────────────────────────┘

BG: rgba(239, 68, 68, 0.1)
Border: #EF4444
Text: #DC2626
Icon: #EF4444
```

### Info Alert
```
┌──────────────────────────────────────────────────────────────┐
│ ⓘ You have 3 pending photos to review.                      │
└──────────────────────────────────────────────────────────────┘

BG: rgba(122, 170, 206, 0.15)
Border: #7AAACE
Text: #50769C
Icon: #7AAACE
```

---

## 7. Photo Gallery

### Photo Grid
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │ │     │
│     │ │     │ │     │ │     │
└─────┘ └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │ │     │
│     │ │     │ │     │ │     │
└─────┘ └─────┘ └─────┘ └─────┘

Page BG:     #F7F8F0
Photo Card:  #FFFFFF
Photo Hover: Scale 1.05, shadow-lg
```

### Photo Overlay
```
┌────────────────────────────────────┐
│                                    │
│        ┌────────┐                  │
│        │        │  👍 24           │  Overlay Gradient:
│        │ Photo  │  ❤️ 18           │  transparent → rgba(53, 88, 114, 0.8)
│        └────────┘  💬 5            │
│                                    │  Reaction Count: #FFFFFF
│                      View Full     │  CTA Button: #7AAACE
└────────────────────────────────────┘
```

---

## 8. Modal / Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  Upload Photo                                    ┬ ━ ╳     │  Header BG: #F7F8F0
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Drag and drop photos here                                  │
│  or                                                          │
│  ┌─────────────────────────────────────────────┐           │
│  │         Browse Files                         │           │  Page BG: rgba(53, 88, 114, 0.5)
│  └─────────────────────────────────────────────┘           │  Modal BG: #FFFFFF
│                                                             │  Title: #355872
├─────────────────────────────────────────────────────────────┤
│                                    ┌──────────┐ ┌────────┐ │  Primary: #355872
│                                    │  Upload  │ │ Cancel │ │  Ghost: Transparent
│                                    └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Loading States

### Skeleton Loading
```
┌────────────────────────────────────────────┐
│  ████████████████  ████████  ████████       │  Shimmer Animation:
│  ████████████████████████  ████████         │  rgba(122, 170, 206, 0.1) →
│  ████████████  ████████████████             │  rgba(122, 170, 206, 0.2) →
│  ████████████████████  ██████████████       │  rgba(122, 170, 206, 0.1)
└────────────────────────────────────────────┘
```

### Spinner
```
   ⚪
  ⚪ ⚪
   ⚪
Primary: #7AAACE
Secondary: rgba(122, 170, 206, 0.3)
```

---

## 10. QR Code Card

```
┌───────────────────────────────────────┐
│                                       │
│        ┌─────────┐                    │
│        │  ▀▄▀▄   │                    │  Card BG: #FFFFFF
│        │  █▄█    │  Scan to           │  Border: rgba(122, 170, 206, 0.2)
│        │  ▀▄▀    │  Upload           │
│        │   ▀▀    │                    │  Title: #355872
│        └─────────┘                    │  Helper: #7AAACE
│                                       │
│      event-xyz.momen.app              │
│                                       │
└───────────────────────────────────────┘
```

---

*Component Color Examples v1.0 - Part of Momen Design System*
