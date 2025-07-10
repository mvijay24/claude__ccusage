# All CCUsage Commands with Examples

## Basic Commands

```bash
# Default command - last 7 days ka usage dikhata hai (jo abhi screenshot me dikh raha)
ccusage

# Specific number of days ka usage dekhne ke liye
ccusage -d 1     # Aaj ka usage (today only)
ccusage -d 3     # Last 3 days
ccusage -d 30    # Last 30 days ka usage
ccusage -d 90    # Last 90 days (3 months)

# Monthly breakdown - mahine wise usage aur cost
ccusage monthly

# 5-hour blocks - Claude ke rate limit windows track karne ke liye
ccusage blocks

# Live monitoring - real-time usage tracking (Ctrl+C to stop)
ccusage blocks --live

# Project/Session wise breakdown - kaunsa project kitna use hua
ccusage session
```

## Quick Shortcuts (cc commands)

```bash
# Basic shortcuts
cc              # Same as ccusage (default 7 days)
cc help         # Show all available shortcuts
cc 30           # Last 30 days ka usage
cc month        # Monthly breakdown
cc m            # Short for monthly
cc block        # Show 5-hour blocks
cc b            # Short for blocks
cc block live   # Live monitoring start karo
cc session      # Project wise usage
cc s            # Short for session
cc all          # Sab views ek saath dikha do

# Daily shortcuts with custom days
cc daily 10     # Last 10 days
cc d 5          # Last 5 days
```

## Hindi Shortcuts (if loaded)

```bash
# Hindi keywords for convenience
mahina          # Monthly usage (same as ccusage monthly)
aaj             # Aaj ka usage (today - same as ccusage -d 1)
kalse           # Kal se ab tak (last 2 days)
haftese         # Last week (7 days)
```

## Direct Aliases

```bash
# Ultra quick aliases
ccu             # ccusage
ccud            # ccusage daily
ccum            # ccusage monthly
ccub            # ccusage blocks
ccul            # ccusage blocks --live
ccus            # ccusage session
cc30            # ccusage -d 30
```

## Advanced Examples

```bash
# Check kitna paisa bach raha hai Max Plus plan pe
ccusage -d 30   # 30 din ka usage dekho, Cost Analysis section me savings dikhegi

# Check which project is using most tokens
ccusage session | head -20   # Top projects by cost

# Monitor current 5-hour block in real-time
ccusage blocks --live       # Live stats with progress bar

# See full month comparison
ccusage monthly             # June vs July comparison with projections

# Quick cost check for this week
ccusage -d 7               # Shows total cost and daily average

# Check cache efficiency
ccusage                    # Statistics section me Cache Efficiency % dikhta hai
```

## What Each Column Means

**Daily Report:**
- Date: Tarikh
- Input Tokens: Request me bheje gaye tokens
- Output Tokens: Claude ne generate kiye tokens  
- Cache Read: Cache se padhe gaye tokens (90% cheaper!)
- Cache Write: Cache me save kiye tokens
- Total Tokens: Sab tokens ka total
- Cost ($): Us din ka total cost
- Requests: Kitne requests kiye
- Projects: Kitne different projects use kiye

**Cost Analysis:**
- Shows savings compared to pay-as-you-go pricing
- Green = You're saving money
- Red = You'd save more on a different plan

## Pro Tips

```bash
# Morning routine - check yesterday's usage
ccusage -d 2

# Weekly review - last week ka full breakdown
ccusage -d 7

# Month end - check monthly spending
ccusage monthly

# Live coding session - monitor current usage
ccusage blocks --live    # Different terminal me chala ke rakho

# Quick reality check - 30 din me kitna kharcha
cc 30
```

Save this file for reference: `/mnt/c/Users/Mahim/Desktop/Claude Code Usage Tool/ALL_COMMANDS.md`