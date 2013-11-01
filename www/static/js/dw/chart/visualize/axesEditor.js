
define(['selectize', 'drag_drop', 'sortable'], function() {

    return {
        init: function(chart, visJSON) {
            var ds = chart.dataset(),
                $c = $('.axes-editor'),
                columnUsed = {},
                chartAxes = chart.get('metadata.axes', {});

            _.each(visJSON.axes, initAxis);

            initDragDrop();

            function initAxis(axis, id) {
                var div = $('.axis', $c).filter(function(i, el) {
                    return $(el).data('axis') == id;
                });
                var s = $('select', div),
                    unused_index = 0;
                ds.eachColumn(function(column, i) {
                    if (_.indexOf(axis.accepts, column.type()) > -1) {
                        var selected = (!axis.multiple && chartAxes[id] == column.name()) ||
                            (axis.multiple && _.indexOf(chartAxes[id], column.name()) > -1) ||
                            (!chartAxes[id] && !columnUsed[column.name()] && (axis.multiple || unused_index===0));
                        if (selected) {
                            columnUsed[column.name()] = true;
                            unused_index++;
                        }
                        $('<option />')
                            .attr('value', column.name())
                            .text(column.title())
                            .prop('selected', selected)
                            .appendTo(s);
                    }
                });
                if (axis.multiple) {
                    s.selectize({
                        plugins: ['drag_drop'],
                        onChange: storeAxesConfig
                    });
                } else {
                    s.selectize({
                        onChange: storeAxesConfig
                    });
                }
                axis.__select = s.get(0).selectize;
            }

            function initDragDrop() {
                $(".selectize-control.multi.plugin-drag_drop", $c).droppable({
                    accept: ".item",
                    drop: function(evt, ui) {
                        var src_axis_el = ui.draggable.parents('.axis'),
                            src_sel = $('select', src_axis_el).get(0).selectize,
                            tgt_sel = $('select', $(evt.target).parents('.axis')).get(0).selectize;
                        if (src_sel != tgt_sel) {
                            //$('.ui-sortable-placeholder', src_axis_el).remove();
                            //src_sel.close();
                            src_sel.removeItem(ui.draggable.data('value'));
                            tgt_sel.addItem(ui.draggable.data('value'));
                            src_sel.blur();
                        }
                    }
                });
            }

            function storeAxesConfig() {
                chartAxes = $.extend({}, chartAxes);
                _.each(visJSON.axes, function(axis, id) {
                    chartAxes[id] = axis.__select.getValue();
                });
                chart.set('metadata.axes', chartAxes);
            }

        }
    };

});