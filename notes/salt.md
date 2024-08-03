# SALT NOTATION [v1/v2, reddit](https://en.reddit.com/r/starcraft/comments/25losh/build_order_tool_salt_update/chiepo3)

# SYMBOLS

```
 !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
```

# SYMBOL MAP

<space> - 0
! - 1
" - 2

# - 3

$ - 4
% - 5
& - 6
' - 7
( - 8
) - 9
* - 10

+ - 11
, - 12

- - 13
. - 14
/ - 15
0 - 16
1 - 17
2 - 18
3 - 19
4 - 20
5 - 21
6 - 22
7 - 23
8 - 24
9 - 25
: - 26
; - 27
< - 28
= - 29
>
> * 30
? - 31
@ - 32
A - 33
B - 34
C - 35
D - 36
E - 37
F - 38
G - 39
H - 40
I - 41
J - 42
K - 43
L - 44
M - 45
N - 46
O - 47
P - 48
Q - 49
R - 50
S - 51
T - 52
U - 53
V - 54
W - 55
X - 56
Y - 57
Z - 58
[ - 59
\ - 60
] - 61
^ - 62
_ - 63
` - 64
a - 65
b - 66
c - 67
d - 68
e - 69
f - 70
g - 71
h - 72
i - 73
j - 74
k - 75
l - 76
m - 77
n - 78
o - 79
p - 80
q - 81
r - 82
s - 83
t - 84
u - 85
v - 86
w - 87
x - 88
y - 89
z - 90
{ - 91
| - 92
} - 93
~ - 94

# SECTIONS

1. TITLE SECTION: [version][title string][~]
2. BO SECTION: [supply][minutes][seconds][percentage*][type][item id]

*Never implemented? (salt v4)

# TYPES [type]

structure = 0
unit = 1
morph = 2
upgrade = 3

# ITEM ID

### STRUCTURES (TYPE 0)

00 Armory
01 Barracks
02 Bunker
03 Command Center
04 Engineering Bay
05 Factory
06 Fusion Core
07 Ghost Academy
08 Missile Turret
09 Reactor (Barracks)
10 Reactor (Factory)
11 Reactor (Starport)
12 Refinery
13 Sensor Tower
14 Starport
15 Supply Depot
16 Tech Lab (Barracks)
17 Tech Lab (Factory)
18 Tech Lab (Starport)
19 Assimilator
20 Cybernetics Core
21 Dark Shrine
22 Fleet Beacon
24 Gateway
25 Nexus
26 Photon Canon
27 Pylon
28 Robotics Bay
29 Robotics Facility
30 Stargate
31 Templar Archives
32 Twilight Council
33 Baneling Nest
46 Creep Tumor
34 Evolution Chamber
35 Extractor
36 Hatchery
37 Hydralisk Den
38 Infestation Pit
39 Nydus Network
40 Roach Warren
41 Spawning Pool
42 Spine Crawler
43 Spire
44 Spore Crawler
45 Ultralisk Cavern

### UNITS (TYPE 1)

00 Banshee
40 Battle Hellion
01 Battlecruiser
02 Ghost
03 Hellion
04 Marauder
05 Marine
06 Medivac
07 Raven
08 Reaper
09 SCV
10 Siege Tank
11 Thor
41 Warhound
42 Widow Mine
12 Viking
13 Archon
14 Carrier
15 Colossus
16 Dark Templar
17 High Templar
18 Immortal
19 Mothership
43 Mothership Core
20 Observer
44 Oracle
21 Phoenix
22 Probe
23 Sentry
24 Stalker
45 Tempest
25 Void Ray
39 Warp Prism
26 Zealot
27 Corruptor
28 Drone
29 Hydralisk
38 Infestor
30 Mutalisk
31 Overlord
32 Queen
33 Roach
46 Swarm Host
34 Ultralisk
47 Viper
35 Zergling

### MORPHS (TYPE 2)

00 Orbital Command
01 Planetary Fortress
02 Warp Gate
03 Lair
04 Hive
05 Greater Spire
06 Brood Lord
07 Baneling
08 Overseer

### UPGRADES (TYPE 3)

00 Terran Building Armor
01 Terran Infantry Armor
02 Terran Infantry Weapons
03 Terran Ship Plating
04 Terran Ship Weapons
05 Terran Vehicle Plating
06 Terran Vehicle Weapons
07 250mm Strike Cannons
08 Banshee - Cloaking
09 Ghost - Cloaking
10 Hellion - Pre-igniter
11 Marine - Stimpack
12 Raven - Seeker Missiles
13 Siege Tank - Siege Tech
46 Ghost - Moebius Reactor
14 Bunker - Neosteel Frame
15 Marauder - Concussive Shells
16 Marine - Combat Shields
17 Reaper Speed
51 Battlecruiser - Behemoth Reactor
52 Battlecruiser - Weapon Refit
53 Hi-Sec Auto Tracking
54 Medivac - Caduceus Reactor
55 Raven - Corvid Reactor
56 Raven - Durable Materials
57 Hellion - Transformation servos
66 Drilling claws
18 Protoss Ground Armor
19 Protoss Ground Weapons
20 Protoss Air Armor
21 Protoss Air Weapons
22 Protoss Shields
23 Sentry - Hallucination
24 High Templar - Psi Storm
25 Stalker - Blink
26 Warp Gate Tech
27 Zealot - Charge
47 Extended Thermal Lance
48 (REMOVED FROM GAME) Khaydarin Amulet
58 Carrier - Graviton Catapult
59 Observer - Gravatic Boosters
60 Warp Prrism - Gravatic Drive
61 Oracle - Bosonic Core
62 Tempest - Gravity Sling
67 Anion Pulse-Crystals
28 Zerg Ground Carapace
29 Zerg Melee Weapons
30 Zerg Flyer Carapace
31 Zerg Flyer Weapons
32 Zerg Missile Weapons
33 Hydralisk - Grooved Spines
34 Overlord - Pneumatized Carapace
35 Overlord - Ventral Sacs
36 Roach - Glial Reconstitution
37 (REMOVED FROM GAME) Roach - Organic Carapace
38 Roach - Tunneling Claws
39 (REMOVED FROM GAME) Ultralisk - Anabolic Synthesis
40 Ultralisk - Chitinous Plating
41 Zergling - Adrenal Glands
42 Zergling - Metabolic Boost
43 (REMOVED FROM GAME) Zergling - Obverse Incubation
44 Burrow
45 Centrifugal Hooks
49 Neural Parasite
50 Pathogen Gland
63 Ultralisk - Evolve Burrow Charge
64 Swarm Host - Evolve Enduring Locusts
65 Hydralisk - Muscular Augments
