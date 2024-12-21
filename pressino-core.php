<?php
/**
 * pressino-core.php
 *
 * Copyright (c) 2021-2024 Joseph Francis / hookedup, inc.
 *
 * This code is released under the GNU General Public License.
 * See COPYRIGHT.txt and LICENSE.txt.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This header and all notices must be kept intact.
 *
 * @author Joseph Francis
 * @package pressino
 * @since pressino 2.0.1
 *
 * Plugin Name: Pressino Core
 * Plugin URI: https://github.com/hookedupjoe/actionapp-wp
 * Description: Robust Web Application Development for WordPress.
 * Author: Joseph Francis
 * Author URI: https://www.hookedup.com
 * Donate-Link: https://www.hookedup.com/
 * Text Domain: actapp
 * License: GPLv3
 * 
 * Version: 2.0.4
 */
define( 'PRESSINO_PLUGIN_CORE_VERSION', '2.0.4' );

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PRESSINO_PLUGIN_FILE', __FILE__ );

if ( !defined( 'PRESSINO_PLUGIN_DIR' ) ) {
	define( 'PRESSINO_PLUGIN_DIR', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
}

if ( !defined( 'PRESSINO_PLUGIN_URL' ) ) {
	define( 'PRESSINO_PLUGIN_URL', plugins_url( 'pressino-core' ) );
}

if ( !defined( 'ACTAPP_CORE_URL' ) ) {
	define( 'ACTAPP_CORE_URL', plugins_url( 'pressino-core' ) );
}

if ( !defined( 'PRESSINO_PLUGIN_IMAGE_PATH' ) ) {
	define( 'PRESSINO_PLUGIN_IMAGE_PATH', PRESSINO_PLUGIN_URL.'/images/' );
}


if ( !defined( 'PRESSINO_PLUGIN_BASE_DIR' ) ) {
	define( 'PRESSINO_PLUGIN_BASE_DIR', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
}

if ( !defined( 'PRESSINO_PLUGIN_BASE_URL' ) ) {
	define( 'PRESSINO_PLUGIN_BASE_URL', plugins_url( 'pressino-core' ) );
}

if ( !defined( 'PRESSINO_PLUGIN_CORE_LIB_URL' ) ) {
	define( 'PRESSINO_PLUGIN_CORE_LIB_URL', PRESSINO_PLUGIN_BASE_URL . '/core' );
}

if ( !defined( 'PRESSINO_PLUGIN_CORE_LIB' ) ) {
	define( 'PRESSINO_PLUGIN_CORE_LIB', PRESSINO_PLUGIN_BASE_DIR . '/core' );
}

require_once PRESSINO_PLUGIN_BASE_DIR . '/cls/ActAppCommon.php';

//---- Blocks Module
define( 'PRESSINO_PLUGIN_BLOCKS_VERSION', '1.0.3' );
define( 'PRESSINO_PLUGIN_BLOCKS_FILE', __FILE__ );

if ( !defined( 'PRESSINO_PLUGIN_BLOCKS_DIR' ) ) {
	define( 'PRESSINO_PLUGIN_BLOCKS_DIR', PRESSINO_PLUGIN_BASE_DIR );
}

if ( !defined( 'PRESSINO_PLUGIN_BLOCKS_URL' ) ) {
	define( 'PRESSINO_PLUGIN_BLOCKS_URL', PRESSINO_PLUGIN_BASE_URL );
}

require_once PRESSINO_PLUGIN_BLOCKS_DIR . '/cls/ActAppWidgetManager.php';
//require_once PRESSINO_PLUGIN_BLOCKS_DIR . '/cls/ActAppWidgetManangerDataController.php';

require_once PRESSINO_PLUGIN_DIR . '/cls/ActAppDesignerDataController.php';
require_once PRESSINO_PLUGIN_DIR . '/cls/ActAppDesigner.php';
