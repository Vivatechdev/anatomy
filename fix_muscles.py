import bpy # type: ignore
import os

filepath = "C:\\Users\\user\\Desktop\\anatomy-viewer\\public\\anatomy_complete.glb"
print("Loading GLB:", filepath)

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import GLB
bpy.ops.import_scene.gltf(filepath=filepath)

keywords = ['muscle', 'muscl', 'oblique', 'deltoid', 'bicep', 'tricep', 
            'quadric', 'hamstr', 'gastrocn', 'pectoral', 'trapezius', 
            'latissimus', 'gluteus', 'soleus', 'tibialis', 'abdomin', 'fascia']

# Ensure 'Muscular' collection exists
if 'Muscular' not in bpy.data.collections:
    muscular_col = bpy.data.collections.new('Muscular')
    bpy.context.scene.collection.children.link(muscular_col)
else:
    muscular_col = bpy.data.collections['Muscular']

# Ensure there is a red material for Muscular
# Create a robust one if missing or rely on an existing name
muscular_mat = None
for mat in bpy.data.materials:
    if 'Muscular' in mat.name:
        muscular_mat = mat
        break

if not muscular_mat:
    muscular_mat = bpy.data.materials.new(name="Muscular")
    muscular_mat.use_nodes = True
    # Base color red
    bsdf = muscular_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.7, 0.05, 0.05, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.7

moved_count = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        name_lower = obj.name.lower()
        if any(k in name_lower for k in keywords):
            
            # Check if it's already in Muscular
            already_in_muscular = False
            for coll in obj.users_collection:
                if coll.name == 'Muscular':
                    already_in_muscular = True
                    break
            
            if not already_in_muscular:
                 # Remove from all other collections
                 for coll in obj.users_collection:
                     coll.objects.unlink(obj)
                 # Link to Muscular
                 muscular_col.objects.link(obj)
                 moved_count += 1
            
            # Assign muscular material if not assigned
            if muscular_mat:
                obj.data.materials.clear()
                obj.data.materials.append(muscular_mat)

print(f"Moved {moved_count} objects to the Muscular collection.")

# Export GLB explicitly
bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB', export_yup=True)
print("Finished exporting to GLB")
