from pathlib import Path
import runpy,shutil
root=Path(__file__).resolve().parent
runpy.run_path(str(root/"upgrade.py"),run_name="__main__")
shutil.copyfile(root/"veradardzru-amulsary-doodle.html",root.parent/"public/game.html")
print("Built public/game.html")
