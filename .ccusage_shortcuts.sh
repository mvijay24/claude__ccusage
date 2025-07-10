#!/bin/bash

# Smart ccusage shortcuts
# Jab bhi koi keyword match kare, ccusage run ho jaye

# Function to run ccusage based on keywords
cc() {
    case "$1" in
        usage|u)
            ccusage
            ;;
        daily|d)
            ccusage -d ${2:-7}
            ;;
        month|m|monthly)
            ccusage monthly
            ;;
        block|b|blocks)
            if [ "$2" = "live" ] || [ "$2" = "l" ]; then
                ccusage blocks --live
            else
                ccusage blocks
            fi
            ;;
        session|s|project|p)
            ccusage session
            ;;
        30|thirty)
            ccusage -d 30
            ;;
        all|a)
            echo "=== Daily Usage (Last 7 days) ==="
            ccusage
            echo -e "\n=== Monthly Usage ==="
            ccusage monthly
            echo -e "\n=== Recent Blocks ==="
            ccusage blocks
            ;;
        help|h|?)
            echo "Claude Code Usage Tracker - Quick Commands:"
            echo "  cc [usage|u]        - Show daily usage (default)"
            echo "  cc daily [N]        - Show last N days (default 7)"
            echo "  cc month|m          - Show monthly breakdown"
            echo "  cc block|b          - Show 5-hour blocks"
            echo "  cc block live       - Live block monitoring"
            echo "  cc session|s        - Show project breakdown"
            echo "  cc 30               - Show last 30 days"
            echo "  cc all              - Show all views"
            echo ""
            echo "Or use full commands:"
            echo "  ccusage             - Default view"
            echo "  ccusage monthly     - Monthly view"
            echo "  ccusage blocks      - Blocks view"
            echo "  ccusage session     - Session view"
            ;;
        *)
            ccusage
            ;;
    esac
}

# Aliases for ultra quick access
alias ccu="ccusage"
alias ccud="ccusage daily"
alias ccum="ccusage monthly" 
alias ccub="ccusage blocks"
alias ccul="ccusage blocks --live"
alias ccus="ccusage session"
alias cc30="ccusage -d 30"

# Hindi keywords 
alias mahina="ccusage monthly"
alias aaj="ccusage -d 1"
alias kalse="ccusage -d 2"
alias haftese="ccusage -d 7"

# Function to check Claude usage with auto keywords
claude() {
    case "$1" in
        kitna|usage|use)
            ccusage
            ;;
        *)
            echo "Use 'claude kitna' or 'cc' to check usage"
            ;;
    esac
}

echo "✅ CCUsage shortcuts loaded! Type 'cc help' for commands"