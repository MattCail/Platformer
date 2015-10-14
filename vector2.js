
var Vector2 = function()
{
	this.x = 0
	this.y = 0
}

Vector2.prototype.set = function(x, y)
{
	this.x = x;
	this.y = y;
}

Vector2.prototype.normalize = function()
{
	var magnitude = (this.x * this.x) + (this.y * this.y);
	magnitude = Math.sqrt(magnitude);
	this.x = this.x / magnitude;
	this.y = this.x / magnitude;
}

Vector2.prototype.add = function(vector)
{
	this.x += vector.x;
	this.y += vector.y;
}

Vector2.prototype.subtract = function(vector)
{
	this.x -= vector.x;
	this.y -= vector.y;
}

Vector2.prototype.multiplyScalar = function(scalar)
{
	this.x *= scalar;
	this.y *= scalar;
}