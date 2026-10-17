# Run pin-pool for a set of decks from plan/queries.json into a side pool.
#   python native/plan/harvest.py <side-name> <deck> <deck> ...
import json, subprocess, sys, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = json.load(open(os.path.join(HERE, 'plan', os.environ.get('HMQ', 'queries.json')), encoding='utf-8'))
side, decks = sys.argv[1], sys.argv[2:]
qs = [q for d in decks for s in Q[d].values() for q in s]
env = dict(os.environ, PIN_POOL=os.path.join(HERE, 'pool', f'side-{side}.json'), PIN_SCROLLS='3')
subprocess.run(['node', os.path.join(HERE, 'pin-pool.mjs'), *qs], env=env, cwd=os.path.dirname(HERE))
print('DONE', side)
