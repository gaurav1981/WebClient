angular.module("proton.networkActivity", ["proton.errorReporter"])
.factory("networkActivityTracker", ($log, errorReporter, $rootScope, notify) => {

    let promises = [];
    const DURATION = 10000; // 10 seconds

    /**
     * Dispatch an action in order to toggle the activityTracker component
     *     - To show: 'load'
     *     - To hide: 'close'
     * @param  {String} action
     * @return {void}
     */
    const dispatch = (action) => $rootScope.$emit('networkActivity', action);

    /**
     * Send an alert notif to the front
     * @param  {String} message
     * @param  {Number} duration
     * @return {void}
     */
    const notifyAlert = (message, duration = DURATION) =>  notify({ message, duration, classes: 'notification-danger' });

    /**
     * Check if we have some promises currently running
     * User to display the loading state
     */
    const loading = () => !_.isEmpty(promises);

    /**
     * Track promise to catch event around
     * @param {object} promise - Promise tracker
     * @return {object} promise - Return the orginal promise to stay in the same context
     */
    const track = (promise) => {
        errorReporter.clear();

        // Display the loader
        if (!promises.length) {
            dispatch('load');
        }

        promises = _.union(promises, [promise]);

        promise.catch(function(error) {
            if(angular.isString(error)) { // Just a String
                notifyAlert(error);
            }

            if(angular.isObject(error)) { // Error Object
                var message;

                if(angular.isDefined(error.message)) {
                    message = error.message;
                } else if(angular.isDefined(error.Error)) {
                    message = error.Error;
                } else {
                    message = 'An error has occurred. Please try again.';
                }

                notifyAlert(message);
            }
        });

        promise.finally(function () {
            promises = _.without(promises, promise);

            // Nothing in the queue hide the loader
            if (!promises.length) {
                dispatch('close');
            }
        });

        return promise;
    };


    const clear = () => {
        errorReporter.clear();
        promises = [];
        return promises;
    };

    return { loading, clear, track, dispatch };
});
