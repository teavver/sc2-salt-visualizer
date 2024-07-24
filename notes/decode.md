Classic BO notation:
  16	  0:44	  Hatchery	  
  17	  1:10	  Extractor	  
  17	  1:00	  Spawning Pool	  
  28	  2:22	  Hatchery	  
  33	  2:50	  Metabolic Boost	  

Salt:
$187350|spawningtool.com||~, K D-!  I-!* C8"5 D="Q#J

Decoding steps:

=== VERSION AND TITLE SECTION ===

$                               = version : 4
187350                          = id of the build order on Spawning Tool (ignore)
187350|spawningtool.com||       = full title
~                               = denote end of ver+title section

=== BUILD ORDER STEPS SECTION ===
```
[CHARACTER]                     [ID] [SECTION]           [VALUE]

,                               = 12 = SUPPLY            = 16
<space>                         = 0  = MINUTES           = 0
K                               = 43 = SECONDS           = 43 (+1?)
<space>                         = 0  = TYPE              = Structure
D                               = 36 = ITEM ID           = Hatchery

-                               = 13 = SUPPLY            = 17
!                               = 1  = MINUTES           = 1
<space>                         = 0  = SECONDS           = 0
<space>                         = 0  = TYPE              = Structure
I                               = 41 = ITEM ID           = Spawning Pool

-                               = 13 = SUPPLY            = 17
!                               = 1  = MINUTES           = 1
*                               = 10 = SECONDS           = 10 (ok?)
<space>                         = 0  = TYPE              = Structure
C                               = 35 = ITEM ID           = Extractor

8                               = 24 = SUPPLY            = 28
"                               = 2  = MINUTES           = 2
5                               = 21 = SECONDS           = 21 (+1?)
<space>                         = 0  = TYPE              = Structure
D                               = 36 = ITEM ID           = Hatchery

=                               = 29 = SUPPLY            = 33
"                               = 2  = MINUTES           = 2
Q                               = 49 = SECONDS           = 50 (+1?)
#                               = 3  = TYPE              = Upgrade
J                               = 42 = ITEM ID           = Zergling - Metabolic Boost
```

<!-- Note that due to size limitations, all workers are removed. Additionally, only the first 3 supply buildings are included, and only the first 10 of any other unit are included. -->