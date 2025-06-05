class LevelEditor {
    constructor(game) {
        this.game = game;
        this.currentTool = 'platform'; // platform, rock, start, end, select
        this.currentRockType = 'rock'; // rock, rock1, rock2, rock3, rock4, rock5
        this.platforms = [];
        this.rocks = [];
        this.startPoint = null;
        this.endPoint = null;
        this.isEditing = false;
        this.selectedObject = null;
        this.isDragging = false;
        this.isRotating = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.rotationHandle = null;
    }

    create() {
        this.createToolbar();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Click handling
        this.game.input.on('pointerdown', (pointer) => {
            if (!this.isEditing) return;
            
            const x = pointer.x;
            const y = pointer.y;

            if (this.currentTool === 'select') {
                this.handleSelection(x, y);
            } else {
                switch(this.currentTool) {
                    case 'platform':
                        this.addPlatform(x, y);
                        break;
                    case 'rock':
                        this.addRock(x, y);
                        break;
                    case 'start':
                        this.setStartPoint(x, y);
                        break;
                    case 'end':
                        this.setEndPoint(x, y);
                        break;
                }
            }
        });

        // Drag handling
        this.game.input.on('pointermove', (pointer) => {
            if (!this.isEditing || !this.selectedObject) return;

            if (this.isDragging) {
                this.selectedObject.x = pointer.x;
                this.selectedObject.y = pointer.y;
                this.updateHandles();
            } else if (this.isRotating) {
                const angle = Phaser.Math.Angle.Between(
                    this.selectedObject.x,
                    this.selectedObject.y,
                    pointer.x,
                    pointer.y
                );
                this.selectedObject.rotation = angle;
                this.updateHandles();
            } else if (this.isResizing) {
                const distance = Phaser.Math.Distance.Between(
                    this.selectedObject.x,
                    this.selectedObject.y,
                    pointer.x,
                    pointer.y
                );
                const scale = distance / 100;
                this.selectedObject.setScale(scale);
                this.updateHandles();
            }
        });

        this.game.input.on('pointerup', () => {
            this.isDragging = false;
            this.isRotating = false;
            this.isResizing = false;
        });
    }

    handleSelection(x, y) {
        // Check if clicked on a handle
        if (this.resizeHandle && this.resizeHandle.getBounds().contains(x, y)) {
            this.isResizing = true;
            return;
        }
        if (this.rotationHandle && this.rotationHandle.getBounds().contains(x, y)) {
            this.isRotating = true;
            return;
        }

        // Check if clicked on an object
        const clickedObject = this.findObjectAt(x, y);
        if (clickedObject) {
            this.selectObject(clickedObject);
            this.isDragging = true;
        } else {
            this.deselectObject();
        }
    }

    findObjectAt(x, y) {
        // Check platforms
        for (const platform of this.platforms) {
            if (platform.getBounds().contains(x, y)) {
                return platform;
            }
        }
        // Check rocks
        for (const rock of this.rocks) {
            if (rock.getBounds().contains(x, y)) {
                return rock;
            }
        }
        return null;
    }

    selectObject(object) {
        this.deselectObject();
        this.selectedObject = object;
        this.createHandles();
    }

    deselectObject() {
        if (this.selectedObject) {
            this.removeHandles();
            this.selectedObject = null;
        }
    }

    createHandles() {
        if (!this.selectedObject) return;

        // Create resize handle
        this.resizeHandle = this.game.add.circle(
            this.selectedObject.x + 50,
            this.selectedObject.y + 50,
            10,
            0x00ff00
        );
        this.resizeHandle.setInteractive();

        // Create rotation handle
        this.rotationHandle = this.game.add.circle(
            this.selectedObject.x - 50,
            this.selectedObject.y - 50,
            10,
            0x0000ff
        );
        this.rotationHandle.setInteractive();
    }

    updateHandles() {
        if (!this.selectedObject || !this.resizeHandle || !this.rotationHandle) return;

        const angle = this.selectedObject.rotation;
        const distance = 50 * this.selectedObject.scale;

        // Update resize handle position
        this.resizeHandle.x = this.selectedObject.x + Math.cos(angle) * distance;
        this.resizeHandle.y = this.selectedObject.y + Math.sin(angle) * distance;

        // Update rotation handle position
        this.rotationHandle.x = this.selectedObject.x + Math.cos(angle + Math.PI) * distance;
        this.rotationHandle.y = this.selectedObject.y + Math.sin(angle + Math.PI) * distance;
    }

    removeHandles() {
        if (this.resizeHandle) {
            this.resizeHandle.destroy();
            this.resizeHandle = null;
        }
        if (this.rotationHandle) {
            this.rotationHandle.destroy();
            this.rotationHandle = null;
        }
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.style.position = 'absolute';
        toolbar.style.top = '10px';
        toolbar.style.left = '10px';
        toolbar.style.backgroundColor = 'rgba(0,0,0,0.7)';
        toolbar.style.padding = '10px';
        toolbar.style.borderRadius = '5px';
        toolbar.style.zIndex = '1000';
        
        // Main tools
        const tools = ['select', 'platform', 'rock', 'start', 'end'];
        tools.forEach(tool => {
            const button = document.createElement('button');
            button.textContent = tool;
            button.style.margin = '5px';
            button.onclick = () => {
                this.currentTool = tool;
                const rockSelection = document.getElementById('rockSelection');
                if (rockSelection) {
                    rockSelection.style.display = tool === 'rock' ? 'block' : 'none';
                }
                this.deselectObject();
            };
            toolbar.appendChild(button);
        });

        // Rock selection submenu
        const rockSelection = document.createElement('div');
        rockSelection.id = 'rockSelection';
        rockSelection.style.display = 'none';
        rockSelection.style.marginTop = '10px';
        rockSelection.style.padding = '5px';
        rockSelection.style.backgroundColor = 'rgba(0,0,0,0.5)';
        rockSelection.style.borderRadius = '3px';

        const rockTypes = ['rock', 'rock1', 'rock2', 'rock3', 'rock4', 'rock5'];
        rockTypes.forEach(type => {
            const rockButton = document.createElement('button');
            rockButton.textContent = type;
            rockButton.style.margin = '2px';
            rockButton.style.width = '60px';
            rockButton.onclick = () => this.currentRockType = type;
            rockSelection.appendChild(rockButton);
        });

        toolbar.appendChild(rockSelection);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Selected';
        deleteButton.style.margin = '5px';
        deleteButton.onclick = () => this.deleteSelected();
        toolbar.appendChild(deleteButton);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Level';
        saveButton.style.margin = '5px';
        saveButton.onclick = () => this.saveLevel();
        toolbar.appendChild(saveButton);

        document.body.appendChild(toolbar);
    }

    deleteSelected() {
        if (!this.selectedObject) return;

        if (this.platforms.includes(this.selectedObject)) {
            const index = this.platforms.indexOf(this.selectedObject);
            this.platforms.splice(index, 1);
        } else if (this.rocks.includes(this.selectedObject)) {
            const index = this.rocks.indexOf(this.selectedObject);
            this.rocks.splice(index, 1);
        }

        this.selectedObject.destroy();
        this.deselectObject();
    }

    addPlatform(x, y) {
        const platform = this.game.add.rectangle(x, y, 100, 20, 0x00ff00);
        this.game.physics.add.existing(platform, true);
        platform.setInteractive();
        this.platforms.push(platform);
    }

    addRock(x, y) {
        const rock = this.game.add.sprite(x, y, this.currentRockType);
        rock.setScale(0.2);
        this.game.physics.add.existing(rock, true);
        rock.setInteractive();
        this.rocks.push(rock);
    }

    setStartPoint(x, y) {
        if (this.startPoint) {
            this.startPoint.destroy();
        }
        this.startPoint = this.game.add.circle(x, y, 10, 0x0000ff);
    }

    setEndPoint(x, y) {
        if (this.endPoint) {
            this.endPoint.destroy();
        }
        this.endPoint = this.game.add.circle(x, y, 10, 0xff0000);
    }

    saveLevel() {
        const levelData = {
            platforms: this.platforms.map(p => ({
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height,
                scale: p.scale,
                rotation: p.rotation
            })),
            rocks: this.rocks.map(r => ({
                x: r.x,
                y: r.y,
                type: r.texture.key,
                scale: r.scale,
                rotation: r.rotation
            })),
            startPoint: this.startPoint ? {
                x: this.startPoint.x,
                y: this.startPoint.y
            } : null,
            endPoint: this.endPoint ? {
                x: this.endPoint.x,
                y: this.endPoint.y
            } : null
        };

        localStorage.setItem('currentLevel', JSON.stringify(levelData));
        console.log('Level saved:', levelData);
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        const toolbar = document.querySelector('div');
        if (toolbar) {
            toolbar.style.display = this.isEditing ? 'block' : 'none';
        }
        this.deselectObject();
    }
} 