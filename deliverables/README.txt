Prerequisites:
- Have http-server installed on your machine:
	In terminal, run "npm install http-server -g"
- It is recommended that you have a GPU better than the Intel Integrated GPU
- Use a modern web browser - Google Chrome is recommended

Instructions:
- On Windows, run "run.bat" in the app directory.
- On UNIX systems, cd into the app directory and execute "http-server".
- Go to localhost:8080 on your web browser.
- More instructions/controls can be found on the page.

Features:
My coursework contains models built in blender,exported to JSON using assimp2json, as well as some objects constructed 
with transformed cubes/cuboids. The blender models include the building, pavement, ground, streetlights, car body and 
wheels. The cube-composed objects include the dumpster and building door.

The sources of light I used include 4 spotlights and 1 directional light, serving as a viewing light which follows the 
camera, pointing towards the origin. There is also ambient light. The spotlights arepoint lights limited to a certain 
angle.

The camera features a full range of motion, implementing a click-and-drag rotation method, scrollwheel to zoom in/out
and ctrl-drag to pan/change the focus point of the scene.

The main animation of this scene is the car that circles the building. It features rotating wheels and turns smoothly
around corners. Other than that, I have also made it such that the front door of Whitechurch can be opened/closed, as
can the dumpster behind Whitechurch.

All the models are texture mapped, with the blender models using a UV map to allow for more intricate details in the
textures. The dumpster/front door also use a texture, but they are block colors instead.