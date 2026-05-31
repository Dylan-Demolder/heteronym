"""
Heteronym — reset streaks and solved puzzles.

Idempotent one-shot script to wipe all player streaks, stats,
and solved-puzzle records from the SQLite database.

Usage:
    python reset.py                  # dry-run (print counts)
    python reset.py --apply          # actually reset
    python reset.py --apply --yes    # auto-confirm
"""
import argparse
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / "heteronym.db"


def get_counts(conn) -> dict:
    cur = conn.execute("SELECT COUNT(*) FROM streaks")
    streaks = cur.fetchone()[0]
    cur = conn.execute("SELECT COUNT(*) FROM solved_puzzles")
    solved = cur.fetchone()[0]
    return {"streaks": streaks, "solved_puzzles": solved}


def main():
    parser = argparse.ArgumentParser(description="Reset heteronym streaks & solved puzzles")
    parser.add_argument("--apply", action="store_true", help="Actually apply the reset")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"Database not found: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(str(DB_PATH))
    try:
        counts = get_counts(conn)
        print(f"Current state:")
        print(f"  streaks:        {counts['streaks']} rows")
        print(f"  solved_puzzles: {counts['solved_puzzles']} rows")

        if not args.apply:
            print("\n[DRY RUN] Pass --apply to actually reset. Nothing changed.")
            return

        if not args.yes:
            ans = input(f"\nReset {counts['streaks']} streak(s) and {counts['solved_puzzles']} solved record(s)? [y/N] ")
            if ans.lower() not in ("y", "yes"):
                print("Aborted.")
                return

        conn.execute("DELETE FROM solved_puzzles")
        conn.execute("DELETE FROM streaks")
        conn.commit()

        after = get_counts(conn)
        print(f"\nReset complete.")
        print(f"  streaks:        {after['streaks']} rows (was {counts['streaks']})")
        print(f"  solved_puzzles: {after['solved_puzzles']} rows (was {counts['solved_puzzles']})")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
