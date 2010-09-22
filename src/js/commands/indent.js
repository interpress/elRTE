/**
 * @class elRTE command.
 * Increase text padding or list items deep.
 * @author Dmitry (dio) Levashov, dio@std42.ru
 **/
elRTE.prototype.commands.indent = function() {
	this.title = 'Indent';
	this.conf  = { step : 20 };
	
	this._exec = function() {
		var sel  = this.sel,
			dom  = this.dom,
			step = parseInt(this.conf.step)||20,
			n    = sel.collapsed() ? [sel.node()] : sel.get(), 
			b    = sel.bookmark(),
			f    = n[0], 
			l    = n[n.length-1],
			li1 = dom.closestParent(f, /^LI$/, true),
			li2 = dom.closestParent(l, /^LI$/, true),
			lst = li1 && li2 ? dom.commonAncestor(li1, li2) : false,
			s, e, p, ilst;
		
		lst = lst ? dom.closestParent(lst, 'list', dom.is(lst, 'list')) : false;

		function indent(n) {
			var p = (dom.is(n, 'text') ? 'padding' : 'margin')+'-left',
				n = $(n);
			n.css(p, (parseInt(n.css(p)) || 0) + step + 'px');
		}
		
		if (lst) {
			// there is common list node
			if (dom.isSiblings(li1, li2) && !(dom.is(li1, 'first') && dom.is(li2, 'last'))) {
				// list items belongs to one parent but is not it's first and last childs  
				if (!(p = dom.prevAll(li1, 'li').shift())) {
					dom.append((p = dom.before(dom.create('li'), li1)), dom.create('br'));
				}
				if (!(ilst = $(p).children('ul')[0])) {
					dom.append(p, (ilst = dom.create(lst.nodeName)));
				}
				dom.append(ilst, dom.traverse(li1, li2));
			} else {
				// list items is first and last childs  
				indent(lst);
			}
		} else {
			if (!(s = dom.closestParent(f, 'blockText', true))) {
				s = dom.topParent(f, 'inline', true);
				s = [s].concat(dom.prevUntil(s, 'any', 'block')).pop();
			}

			if (!(e = dom.closestParent(l, 'blockText', true))) {

				e = dom.topParent(l, 'inline', true);
				e = [e].concat(dom.nextUntil(e, 'any', 'block')).pop();
			}
			n = dom.traverse(s, e);
			
			o = { 
				accept  : 'any', 
				wrap    : function(n) { dom.wrap(n, { name : dom.topParent(n[0], 'blockText') ? 'div' : 'p', css : { 'padding-left' : step+'px' } }); }, 
				inner   : false, 
				testCss : 'blockText', 
				setCss  : function(n) {  
						var p = (dom.is(n, 'text') ? 'padding' : 'margin')+'-left', n = $(n);
						n.css(p, (parseInt(n.css(p)) || 0) + step + 'px');
					} 
			};
			dom.smartWrap(n, o);
		}
		sel.toBookmark(b);
		return true;
	}
	
	this.events = {
		'wysiwyg'      : function() { this._setState(this.STATE_ENABLE); },
		'source close' : function(e) { e.data.id == this.rte.active.id && this._setState(this.STATE_DISABLE); }
	}
	
}

