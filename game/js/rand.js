function RandGenerator(seed)
{
    this.seed_ = seed || Math.random();
}

RandGenerator.prototype.next = function(max, min)
{
    max = max || 1;
    min = min || 0;
 
    this.seed_ = (this.seed_ * 9301 + 49297) % 233280;
    var rnd = this.seed_ / 233280;
 
    return min + rnd * (max - min);    
}